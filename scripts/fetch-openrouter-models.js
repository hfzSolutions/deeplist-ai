#!/usr/bin/env node

/**
 * Script to fetch free models from OpenRouter API and generate a migration file
 * Usage: node scripts/fetch-openrouter-models.js
 */

const fs = require("fs")
const path = require("path")
const https = require("https")

// OpenRouter API endpoint
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/models"

// Function to make HTTPS request
function fetchModels() {
  return new Promise((resolve, reject) => {
    const req = https.get(OPENROUTER_API_URL, (res) => {
      let data = ""

      res.on("data", (chunk) => {
        data += chunk
      })

      res.on("end", () => {
        try {
          const jsonData = JSON.parse(data)
          resolve(jsonData)
        } catch (error) {
          reject(new Error(`Failed to parse JSON: ${error.message}`))
        }
      })
    })

    req.on("error", (error) => {
      reject(new Error(`Request failed: ${error.message}`))
    })

    req.setTimeout(30000, () => {
      req.destroy()
      reject(new Error("Request timeout"))
    })
  })
}

// Function to filter free models
function filterFreeModels(models) {
  return models.filter((model) => {
    const pricing = model.pricing
    // Check if both prompt and completion are free ("0")
    return (
      pricing &&
      (pricing.prompt === "0" || pricing.prompt === 0) &&
      (pricing.completion === "0" || pricing.completion === 0)
    )
  })
}

// Function to map OpenRouter model to our database schema
function mapModelToSchema(model, index) {
  // Extract provider from model ID (e.g., "openai/gpt-4" -> "openai")
  const modelParts = model.id.split("/")
  const provider = modelParts[0] || "unknown"
  const modelName = modelParts.slice(1).join("/") || model.id

  // Generate capabilities based on model features
  const capabilities = []
  if (model.architecture?.input_modalities?.includes("text"))
    capabilities.push("chat")
  if (model.architecture?.input_modalities?.includes("image"))
    capabilities.push("vision")
  if (model.supported_parameters?.includes("tools")) capabilities.push("tools")
  if (model.id.includes("reasoning") || model.id.includes("r1"))
    capabilities.push("reasoning")
  if (model.id.includes("search") || model.id.includes("online"))
    capabilities.push("search")

  return {
    name: `openrouter:${model.id}`,
    display_name: model.name || model.id,
    provider_id: "openrouter",
    provider_name: "OpenRouter",
    model_id: model.id,
    context_length:
      model.context_length || model.top_provider?.context_length || null,
    max_tokens: model.top_provider?.max_completion_tokens || null,
    is_enabled: true,
    is_free: true,
    requires_api_key: false,
    capabilities: capabilities.length > 0 ? capabilities : ["chat"],
    description:
      model.description || `${model.name} - Free model from OpenRouter`,
    sort_order: index + 1,
  }
}

// Function to generate SQL migration
function generateMigration(models) {
  const timestamp = new Date()
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\..+/, "")
    .substring(0, 14)
  const filename = `006_populate_free_openrouter_models_${timestamp}.sql`

  let sql = `-- Populate models table with free OpenRouter models\n`
  sql += `-- Generated on ${new Date().toISOString()}\n`
  sql += `-- Total free models found: ${models.length}\n\n`

  sql += `-- Clear existing models first\n`
  sql += `DELETE FROM public.models;\n\n`

  sql += `-- Insert free OpenRouter models\n`
  sql += `INSERT INTO public.models (name, display_name, provider_id, provider_name, model_id, context_length, max_tokens, is_enabled, is_free, requires_api_key, capabilities, description, sort_order) VALUES\n`

  const values = models.map((model, index) => {
    const m = mapModelToSchema(model, index)
    const capabilities = `ARRAY[${m.capabilities.map((c) => `'${c}'`).join(", ")}]`
    const description = m.description.replace(/'/g, "''") // Escape single quotes

    return `('${m.name}', '${m.display_name}', '${m.provider_id}', '${m.provider_name}', '${m.model_id}', ${m.context_length}, ${m.max_tokens}, ${m.is_enabled}, ${m.is_free}, ${m.requires_api_key}, ${capabilities}, '${description}', ${m.sort_order})`
  })

  sql += values.join(",\n")
  sql += `;\n\n`

  sql += `-- Handle conflicts by updating existing records\n`
  sql += `ON CONFLICT (name) DO UPDATE SET\n`
  sql += `  display_name = EXCLUDED.display_name,\n`
  sql += `  provider_id = EXCLUDED.provider_id,\n`
  sql += `  provider_name = EXCLUDED.provider_name,\n`
  sql += `  model_id = EXCLUDED.model_id,\n`
  sql += `  context_length = EXCLUDED.context_length,\n`
  sql += `  max_tokens = EXCLUDED.max_tokens,\n`
  sql += `  is_enabled = EXCLUDED.is_enabled,\n`
  sql += `  is_free = EXCLUDED.is_free,\n`
  sql += `  requires_api_key = EXCLUDED.requires_api_key,\n`
  sql += `  capabilities = EXCLUDED.capabilities,\n`
  sql += `  description = EXCLUDED.description,\n`
  sql += `  sort_order = EXCLUDED.sort_order,\n`
  sql += `  updated_at = NOW();\n\n`

  // Set first free model as default if no default exists
  if (models.length > 0) {
    const firstModel = mapModelToSchema(models[0], 0)
    sql += `-- Update default model setting to use first free model\n`
    sql += `INSERT INTO public.app_settings (key, value, description)\n`
    sql += `VALUES ('default_model', '"${firstModel.name}"', 'Default model for new chats')\n`
    sql += `ON CONFLICT (key) DO UPDATE SET\n`
    sql += `  value = EXCLUDED.value,\n`
    sql += `  updated_at = NOW();\n`
  }

  return { filename, sql }
}

// Main function
async function main() {
  try {
    console.log("Fetching models from OpenRouter API...")
    const response = await fetchModels()

    if (!response.data || !Array.isArray(response.data)) {
      throw new Error("Invalid API response format")
    }

    console.log(`Found ${response.data.length} total models`)

    const freeModels = filterFreeModels(response.data)
    console.log(`Found ${freeModels.length} free models`)

    if (freeModels.length === 0) {
      console.log("No free models found. Exiting.")
      return
    }

    // Log some free models for verification
    console.log("\nSample free models:")
    freeModels.slice(0, 5).forEach((model) => {
      console.log(`- ${model.id}: ${model.name}`)
    })

    const migration = generateMigration(freeModels)
    const migrationPath = path.join(
      __dirname,
      "..",
      "migrations",
      migration.filename
    )

    fs.writeFileSync(migrationPath, migration.sql)
    console.log(`\nMigration file created: ${migration.filename}`)
    console.log(`Path: ${migrationPath}`)
    console.log(`\nTo apply the migration, run:`)
    console.log(`supabase db push --include-all`)
  } catch (error) {
    console.error("Error:", error.message)
    process.exit(1)
  }
}

// Run the script
if (require.main === module) {
  main()
}

module.exports = {
  fetchModels,
  filterFreeModels,
  mapModelToSchema,
  generateMigration,
}

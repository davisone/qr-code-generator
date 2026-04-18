import { NextResponse } from "next/server";
import { BASE_URL } from "@/lib/config";

/**
 * Spécification OpenAPI 3.1 de l'API publique v1.
 * Utilisable dans Postman, Insomnia, Stoplight, etc.
 */
export async function GET() {
  const spec = {
    openapi: "3.1.0",
    info: {
      title: "QRaft API",
      version: "1.0.0",
      description: "API publique pour créer des QR codes et consulter leurs analytics.",
      contact: { name: "QRaft", url: BASE_URL },
    },
    servers: [{ url: `${BASE_URL}/api/v1`, description: "Production" }],
    security: [{ bearerAuth: [] }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "qft_<random>",
          description: "Clé API générée depuis /api-keys (format qft_...).",
        },
      },
      schemas: {
        QRCode: {
          type: "object",
          properties: {
            id: { type: "string" },
            name: { type: "string" },
            type: { type: "string", enum: ["url", "text", "wifi", "vcard", "email", "phone", "sms", "whatsapp", "geo", "social"] },
            content: { type: "string" },
            shareToken: { type: "string", nullable: true },
            shareUrl: { type: "string", nullable: true, format: "uri" },
            foregroundColor: { type: "string", pattern: "^#[0-9a-fA-F]{6}$" },
            backgroundColor: { type: "string", pattern: "^#[0-9a-fA-F]{6}$" },
            size: { type: "integer", minimum: 128, maximum: 2048 },
            errorCorrection: { type: "string", enum: ["L", "M", "Q", "H"] },
            category: { type: "string", nullable: true },
            createdAt: { type: "string", format: "date-time" },
            expiresAt: { type: "string", format: "date-time", nullable: true },
          },
        },
        QRCodeDetail: {
          allOf: [
            { $ref: "#/components/schemas/QRCode" },
            {
              type: "object",
              properties: {
                isPublic: { type: "boolean" },
                isFavorite: { type: "boolean" },
                scanCount: { type: "integer" },
                updatedAt: { type: "string", format: "date-time" },
              },
            },
          ],
        },
        CreateQRCodeBody: {
          type: "object",
          required: ["name", "content"],
          properties: {
            name: { type: "string", maxLength: 100 },
            content: { type: "string" },
            type: { type: "string", enum: ["url", "text", "wifi", "vcard", "email", "phone", "sms", "whatsapp", "geo", "social"], default: "url" },
            foregroundColor: { type: "string", pattern: "^#[0-9a-fA-F]{6}$", default: "#1a1410" },
            backgroundColor: { type: "string", pattern: "^#[0-9a-fA-F]{6}$", default: "#ffffff" },
            errorCorrection: { type: "string", enum: ["L", "M", "Q", "H"], default: "M" },
            size: { type: "integer", minimum: 128, maximum: 2048, default: 512 },
            category: { type: "string" },
          },
        },
        Analytics: {
          type: "object",
          properties: {
            totalScans: { type: "integer" },
            uniqueCountries: { type: "integer" },
            uniqueCities: { type: "integer" },
            byDevice: { type: "array", items: { type: "object", properties: { device: { type: "string" }, count: { type: "integer" } } } },
            byBrowser: { type: "array", items: { type: "object", properties: { browser: { type: "string" }, count: { type: "integer" } } } },
            byOs: { type: "array", items: { type: "object", properties: { os: { type: "string" }, count: { type: "integer" } } } },
            byCountry: { type: "array", items: { type: "object", properties: { country: { type: "string" }, count: { type: "integer" } } } },
            timeline: { type: "array", items: { type: "object", properties: { date: { type: "string", format: "date" }, scans: { type: "integer" } } } },
          },
        },
        Scan: {
          type: "object",
          properties: {
            id: { type: "string" },
            qrCodeId: { type: "string" },
            country: { type: "string", nullable: true },
            city: { type: "string", nullable: true },
            device: { type: "string", nullable: true },
            browser: { type: "string", nullable: true },
            os: { type: "string", nullable: true },
            latitude: { type: "number", nullable: true },
            longitude: { type: "number", nullable: true },
            scannedAt: { type: "string", format: "date-time" },
          },
        },
        ScanPage: {
          type: "object",
          properties: {
            data: { type: "array", items: { $ref: "#/components/schemas/Scan" } },
            nextCursor: { type: "string", nullable: true },
          },
        },
        Error: {
          type: "object",
          properties: {
            error: { type: "string" },
            message: { type: "string" },
          },
        },
      },
      responses: {
        Unauthorized: {
          description: "Missing or invalid API key.",
          content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
        },
        NotFound: {
          description: "Resource not found.",
          content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
        },
        RateLimited: {
          description: "Rate limit exceeded.",
          headers: {
            "X-RateLimit-Limit": { schema: { type: "integer" } },
            "X-RateLimit-Remaining": { schema: { type: "integer" } },
            "X-RateLimit-Reset": { schema: { type: "integer" } },
          },
          content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
        },
        ValidationError: {
          description: "Invalid request body or parameters.",
          content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
        },
      },
    },
    paths: {
      "/qrcodes": {
        post: {
          summary: "Créer un QR code",
          operationId: "createQRCode",
          tags: ["QR codes"],
          requestBody: {
            required: true,
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/CreateQRCodeBody" } },
            },
          },
          responses: {
            "201": {
              description: "QR code créé.",
              content: { "application/json": { schema: { $ref: "#/components/schemas/QRCode" } } },
            },
            "400": { $ref: "#/components/responses/ValidationError" },
            "401": { $ref: "#/components/responses/Unauthorized" },
            "429": { $ref: "#/components/responses/RateLimited" },
          },
        },
      },
      "/qrcodes/{id}": {
        get: {
          summary: "Obtenir un QR code",
          operationId: "getQRCode",
          tags: ["QR codes"],
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "string" } },
          ],
          responses: {
            "200": {
              description: "Détails du QR code.",
              content: { "application/json": { schema: { $ref: "#/components/schemas/QRCodeDetail" } } },
            },
            "401": { $ref: "#/components/responses/Unauthorized" },
            "404": { $ref: "#/components/responses/NotFound" },
            "429": { $ref: "#/components/responses/RateLimited" },
          },
        },
      },
      "/qrcodes/{id}/analytics": {
        get: {
          summary: "Analytics agrégées d'un QR code",
          operationId: "getQRCodeAnalytics",
          tags: ["Analytics"],
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "string" } },
            { name: "days", in: "query", required: false, schema: { type: "integer", minimum: 1, maximum: 365, default: 30 } },
          ],
          responses: {
            "200": {
              description: "Statistiques.",
              content: { "application/json": { schema: { $ref: "#/components/schemas/Analytics" } } },
            },
            "400": { $ref: "#/components/responses/ValidationError" },
            "401": { $ref: "#/components/responses/Unauthorized" },
            "404": { $ref: "#/components/responses/NotFound" },
            "429": { $ref: "#/components/responses/RateLimited" },
          },
        },
      },
      "/qrcodes/{id}/scans": {
        get: {
          summary: "Liste paginée des scans",
          operationId: "listQRCodeScans",
          tags: ["Analytics"],
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "string" } },
            { name: "limit", in: "query", required: false, schema: { type: "integer", minimum: 1, maximum: 500, default: 100 } },
            { name: "cursor", in: "query", required: false, schema: { type: "string" } },
          ],
          responses: {
            "200": {
              description: "Page de scans.",
              content: { "application/json": { schema: { $ref: "#/components/schemas/ScanPage" } } },
            },
            "400": { $ref: "#/components/responses/ValidationError" },
            "401": { $ref: "#/components/responses/Unauthorized" },
            "404": { $ref: "#/components/responses/NotFound" },
            "429": { $ref: "#/components/responses/RateLimited" },
          },
        },
      },
    },
  } as const;

  return NextResponse.json(spec, {
    headers: {
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}

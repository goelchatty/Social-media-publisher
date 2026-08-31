# Social Media Publisher

An automated, decentralized multi-platform content curation and publishing platform. The system ingests technical content, leverages customizable Large Language Models and visual generation pipelines to synthesize executive summaries and social assets, and provides an editorial approval workflow before dispatching to LinkedIn and Instagram.

---

## Key Features

- **Decentralized Bring-Your-Own-Key (BYOK) Architecture**: Users configure their own API endpoints, keys, and model parameters (Groq, OpenAI, Cloudflare, etc.) without central backend dependencies.
- **Editorial Review Workflow**: Post copy, executive briefings, and visual infographics are previewed and editable prior to distribution.
- **Multi-Tenant Scoped Storage**: Client-side authentication isolates individual profile configurations and credentials securely per account.
- **n8n Orchestration Engine**: Webhook-driven orchestration handles data ingestion, AI prompt formatting, JSON sanitization, and social API calls.

---

## Architecture Pipeline

1. **Ingestion & Synthesis Webhook**:
   - Triggers RSS feed parsing.
   - Dispatches custom LLM requests to generate executive briefings and platform-specific copy.
   - Calls generative image APIs to generate infographic visual assets.
   - Returns structured JSON to the client dashboard for review.
2. **Editorial Studio**:
   - User reviews and edits generated briefings, captions, and visual assets.
3. **Distribution Webhook**:
   - Submits approved payloads to LinkedIn and Instagram endpoints.

---

## Local Setup & Development

1. **Clone Repository**:
   ```bash
   git clone [https://github.com/](https://github.com/)<your-username>/social-media-publisher.git
   cd social-media-publisher
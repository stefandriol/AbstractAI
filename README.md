# arXiv-summary
Summarizes today's papers on selected arxiv subcategories with genrative AI.

## Running Locally

Go to [OpenAI](https://beta.openai.com/account/api-keys) to make an account and put your API key in a file called `.env`.

Also add KV redis Vercel database credentials:
KV_URL="xxx"
KV_REST_API_URL="xxx"
KV_REST_API_TOKEN="xxx"
KV_REST_API_READ_ONLY_TOKEN="xxx"

Then, run the application in the command line and it will be available at `http://localhost:3000`.

```bash
pnpm install
pnpm run dev
```

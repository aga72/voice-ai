# Voice Demo App (Hello World)

## What this is
A beginner-friendly full-stack starter to deploy a simple web app on GCP (Cloud Run), built in VS Code.

## Setup Steps
1. Install VS Code.
2. Install Docker Desktop (so you have a local container engine; VS Code container tooling relies on an engine).
3. Verify Docker is installed and quick sanity test Docker without leaving a container or image behind:
    ```bash
    docker --version
    docker run --rm hello-world 
    docker image rm hello-world 
    ```
4. Install Git for Windows.
5. Create a Google account (if needed) and create a GCP project in Google Cloud Console.
6. Install the Google Cloud CLI (gcloud) on Windows.
7. Verify the CLI is installed:
   ```bash
   gcloud version
   ```
8. Initialize/authenticate your local machine with GCP:
   ```bash
   gcloud init
   ```
9. Confirm gcloud is pointing at the intended project (and set it if needed):
   ```bash
   gcloud config get-value project
   gcloud config set project <PROJECT_ID>
   ```
10. Install [Node](https://nodejs.org/en/download) for Windows.
11. Verify Node and NPM are installed:
    ```bash
    node --version
    npm --version
    ```
12. Navigate to your project root directory:
    ```bash
    cd path\to\your\project
    ```
13. Create a new React + TypeScript project with Vite:
    ```bash
    npm create vite@latest frontend-react -- --template react-ts
    ```
14. Navigate into the new frontend directory and install dependencies:
    ```bash
    cd frontend-react
    npm install
    ```
15. Start the React development server:
    ```bash
    npm run dev
    ```
16. Open your browser to http://localhost:5173/ to verify the React app is running.
17. Press `Ctrl + C` in the terminal to stop the dev server when done.

## Useful Frontend (React) commands
```bash
cd frontend-react
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build locally
```

## Useful Git commands
1. Create a root `.gitignore` (so generated files don’t get committed); GitHub maintains common templates you can borrow from.
2. Initialize a local Git repo in the project folder:
    ```bash
    git init
    ```
3. Create your first commit (baseline snapshot):
    ```bash
    git add .
    git commit -m "Initial commit"
    ```

## Useful Docker commands
1. Start the application locally with Docker Compose:
    ```bash
    docker-compose up ---build
    ```
2. Stop and remove containers:
      ```bash
    docker-compose down
    ```

## Useful GCP commands
1. Enable Cloud Run APIs in your GCP project (required before deploying):
    ```bash
    gcloud services enable run.googleapis.com cloudbuild.googleapis.com
    ```
2. Deploy to Cloud Run as a public URL (temporary demo-style access):
    ```bash
    gcloud run deploy <SERVICE_NAME> --source . --region us-central1 --allow-unauthenticated --env-vars-file env.yaml
    ```
3. Make the public URL unavailable (without deleting the service) by removing public invoker access:
    ```bash
    gcloud run services remove-iam-policy-binding <SERVICE_NAME> --region us-central1 --member "allUsers" --role "roles/run.invoker"
    ```
4. Update (redeploy) after source changes by deploying the same service name again:
    ```bash
    gcloud run deploy <SERVICE_NAME> --source . --region us-central1 --allow-unauthenticated
    ```
5. Permanently delete the Cloud Run service:
    ```bash
    gcloud run services delete <SERVICE_NAME> --region us-central1
    ```

## Repo structure
- frontend/  (React - later)
- backend/   (FastAPI - serves Hello World for now)

## Run locally (backend)
cd backend
# (commands will be added in the next steps)

## Deploy (later)
We will deploy the backend to Cloud Run using gcloud.

## Plan

### Phase 1: Basic AI Text Integration (Gemini)

Goal: Add simple text-only AI responses using Gemini.

- Obtain a Gemini API key from Google AI Studio.
- Store the key in a local `.env` file and pass it into the backend container.
- Install the Gemini SDK in the backend.
- Add a basic `POST /api/chat` endpoint that:
  - Accepts a simple text prompt.
  - Calls the Gemini API with that prompt.
  - Returns the generated reply as JSON.
- Update the frontend to:
  - Add a “Chat with AI” input and button.
  - Call `/api/chat` and display the single-shot reply.

---

### Phase 2: Streaming AI Responses

Goal: Improve UX by streaming AI responses instead of waiting for the full message.

- Add a `POST /api/chat/stream` backend endpoint that:
  - Calls Gemini in streaming mode.
  - Streams text chunks back to the client.
- Update the frontend to:
  - Consume a streaming response.
  - Append chunks to the UI as they arrive (typewriter effect).
- Add a scrolling conversation area to display multiple turns.

---

### Phase 3: Conversation Memory (Multi-Turn Chat)

Goal: Let the AI remember previous messages within a session.

- Design a Firestore schema for conversations:
  - `conversations` collection with metadata (timestamps, user ID).
  - `messages` subcollection with `role` (`user` / `model`), text, and timestamp.
- Backend:
  - Endpoint to create a new conversation and return a `conversation_id`.
  - Endpoint to send a message within a conversation:
    - Store the user message.
    - Retrieve previous messages for that conversation.
    - Build a history/context for the Gemini call.
    - Stream the AI response.
    - Store the AI reply back into Firestore.
- Frontend:
  - Manage a current `conversation_id`.
  - Start a new conversation on page load or via a “New conversation” button.
  - Send messages to the conversation-aware endpoint.
  - Display messages in a chat-like interface.

---

### Phase 4: Voice Input (Speech-to-Text)

Goal: Let users speak instead of typing.

- Start with browser-based speech recognition for simplicity:
  - Use the Web Speech API where available (e.g., Chrome).
- Frontend:
  - Add a microphone button next to the chat input.
  - When clicked:
    - Start listening.
    - Convert speech to text.
    - Insert the transcribed text into the chat input field.
- Keep the flow simple:
  - User speaks → text appears → user presses Send → backend handles text as usual.

---

### Phase 5: Voice Output (Text-to-Speech)

Goal: Have the AI speak responses back to the user.

- Use the browser’s SpeechSynthesis API:
  - Convert text replies into spoken audio.
- Frontend:
  - Add a toggle/checkbox such as “Read responses aloud.”
  - If enabled:
    - After a full AI response is received (including streaming completion), pass the final text to text-to-speech.
  - Allow basic controls (rate, pitch, language) later as enhancements.

---

### Phase 6: Thought-Partner Behavior (Prompt Design)

Goal: Shape the AI into a curiosity-driven thought partner, not just a Q&A bot.

- Define a system prompt that:
  - Emphasizes curiosity, exploration, and multi-perspective thinking.
  - Encourages clarifying questions and critical thinking.
  - Sets tone guidelines (warm, non-judgmental, concise).
- Pass this system prompt when configuring the Gemini model.
- Iterate on the prompt based on real conversations:
  - Adjust how reflective, probing, or directive the AI should be.
  - Tune length and style of responses.

---

### Phase 7: User Profiles & Personalization

Goal: Keep track of users and personalize interactions.

- Firestore:
  - `users` collection with:
    - Basic profile data (e.g., name, created_at).
    - Preferences (e.g., conversation style, topics of interest).
    - List of conversation IDs associated with each user.
- Backend:
  - Endpoint to create a user (e.g., from a simple “name” field).
  - Modify conversation creation to link conversations to a user.
- Frontend:
  - Simple “enter your name” or “start” screen.
  - After creation, store `user_id` in memory for the session.
  - Create conversations tied to that `user_id`.

---

### Phase 8: Production-Ready Cloud Run Deployment

Goal: Run the system reliably and securely in the cloud.

- Docker:
  - Update the Dockerfile so it does not depend on local credential files in production.
- Cloud Run:
  - Set environment variables (e.g., `GEMINI_API_KEY`) via Cloud Run configuration.
  - Ensure the Firebase Admin SDK uses Cloud Run’s service account for Firestore access.
- Testing:
  - Deploy updated image to Cloud Run.
  - Verify:
    - Basic chat.
    - Streaming.
    - Conversation memory.
    - Voice input/output (where browser supports it).
  - Monitor logs and error messages.

---

### Phase 9: Advanced Features (Future)

These are stretch goals for later iterations.

- Conversation history page:
  - List past conversations and allow resuming them.
- Semantic memory / vector search:
  - Embed messages.
  - Retrieve similar past conversations to provide richer context.
- Multi-modal input:
  - Add support for images or files.
  - Use models that can interpret visual inputs as part of the conversation.
- Analytics and insights:
  - Track usage and conversation patterns.
  - Build dashboards for engagement and topic analysis.
- Authentication:
  - Add real user authentication (e.g., Firebase Auth).
  - Secure endpoints using user identity.
- Mobile optimization:
  - Make the UI responsive and mobile-friendly.
  - Optionally add PWA support for “installable” behavior.
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
    gcloud run deploy <SERVICE_NAME> --source . --region us-central1 --allow-unauthenticated
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

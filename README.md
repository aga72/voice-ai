# Voice Demo App (Hello World)

## Setup Steps
1. Install VS Code.
2. Create a Google account (if needed) and create a GCP project in Google Cloud Console.
3. Install the Google Cloud CLI (gcloud) on Windows.
4. Verify the CLI is installed:
   ```bash
   gcloud version
   ```
5. Initialize/authenticate your local machine with GCP:
   ```bash
   gcloud init
   ```
6. Confirm gcloud is pointing at the intended project (and set it if needed):
   ```bash
   gcloud config get-value project
   gcloud config set project <PROJECT_ID>
   ```
7. Install Git for Windows.
8. Create your local project folder and open it in VS Code.
9. Create top-level folders: `frontend/`, `backend/`
10. Create a root `README.md` (so the repo has a landing page on GitHub).
11. Create a root `.gitignore` (so generated files don’t get committed); GitHub maintains common templates you can borrow from.
12. Initialize a local Git repo in the project folder:
    ```bash
    git init
    ```
13. Create your first commit (baseline snapshot):
    ```bash
    git add .
    git commit -m "Initial commit"
    ```
14. Create an empty GitHub repository, add it as a remote, and push your local commits (so local and remote are synced).
15. Install VS Code productivity extensions (optional but helpful), including Cloud Code for GCP workflows.
16. Install Docker Desktop (so you have a local container engine; VS Code container tooling relies on an engine).
17. Verify Docker is installed:
    ```bash
    docker --version
    ```
18. Quick sanity test Docker without leaving a container behind:
    ```bash
    docker run --rm hello-world 
    # (removes the container automatically after it exits).

    docker image rm hello-world 
    # (removes the pulled image if you want zero leftovers).
    ```
19. Enable Cloud Run APIs in your GCP project (required before deploying):
    ```bash
    gcloud services enable run.googleapis.com cloudbuild.googleapis.com
    ```
20. Deploy to Cloud Run as a public URL (temporary demo-style access):
    ```bash
    gcloud run deploy <SERVICE_NAME> --source . --region us-central1 --allow-unauthenticated
    ```
21. Make the public URL unavailable (without deleting the service) by removing public invoker access:
    ```bash
    gcloud run services remove-iam-policy-binding <SERVICE_NAME> --region us-central1 --member "allUsers" --role "roles/run.invoker"
    ```
22. Update (redeploy) after source changes by deploying the same service name again:
    ```bash
    gcloud run deploy <SERVICE_NAME> --source . --region us-central1 --allow-unauthenticated
    ```
23. Permanently delete the Cloud Run service:
    ```bash
    gcloud run services delete <SERVICE_NAME> --region us-central1
    ```


## What this is
A beginner-friendly full-stack starter to deploy a simple web app on GCP (Cloud Run), built in VS Code.

## Repo structure
- frontend/  (React - later)
- backend/   (FastAPI - serves Hello World for now)

## Run locally (backend)
cd backend
# (commands will be added in the next steps)

## Deploy (later)
We will deploy the backend to Cloud Run using gcloud.

import pkg from "./package.json" with { type: "json" };

export const APP_NAME = "Limit Counter";

export const GITHUB_USERNAME = pkg.author;

export const GITHUB_REPO_URL = pkg.repository.url;
export const GITHUB_REPO = GITHUB_REPO_URL.split("/").pop();

#!/usr/bin/env bash
#
# push_all_branches.sh
#
# Description:
#  - Stage local changes (if any), create a commit (if needed), and push the current HEAD
#    to the remote branches: master, main, develop.
#  - Safe-by-default: will not force push unless you pass --force or --force-with-lease.
#
# Usage:
#   chmod +x scripts/push_all_branches.sh
#   ./scripts/push_all_branches.sh [--force] [--force-with-lease] ["Commit message here"]
#
# Examples:
#   ./scripts/push_all_branches.sh "Update webhook handler"
#   ./scripts/push_all_branches.sh --force-with-lease "Apply hotfix"
#
# Where to run: repository root (e.g., ~/projects/m4capital)
# Make sure `origin` points to https://github.com/shangme65/m4capital.git
#
# Identity (optional):
#   export GIT_USER_NAME="shangme65"
#   export GIT_USER_EMAIL="shangme65@gmail.com"
#
set -euo pipefail

REPO_URL="https://github.com/shangme65/m4capital.git"
BRANCHES=(master main develop)

# Parse args
FORCE_MODE=""   # "", "--force", or "--force-with-lease"
COMMIT_MSG=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --force)
      FORCE_MODE="--force"
      shift
      ;;
    --force-with-lease)
      FORCE_MODE="--force-with-lease"
      shift
      ;;
    -*)
      echo "Unknown option: $1"
      exit 1
      ;;
    *)
      COMMIT_MSG="$1"
      shift
      ;;
  esac
done

# Ensure we are inside a git repository
if ! git rev-parse --git-dir >/dev/null 2>&1; then
  echo "Error: not a git repository. cd to your repo root and run again."
  exit 2
fi

# Ensure origin is set or set it if missing
if ! git remote get-url origin >/dev/null 2>&1; then
  echo "No 'origin' remote found. Setting origin to ${REPO_URL}"
  git remote add origin "${REPO_URL}"
fi

# Optional: configure local git user if variables are set
if [[ -n "${GIT_USER_NAME:-}" ]]; then
  git config user.name "${GIT_USER_NAME}"
fi
if [[ -n "${GIT_USER_EMAIL:-}" ]]; then
  git config user.email "${GIT_USER_EMAIL}"
fi

# Fetch remote metadata
echo "Fetching origin..."
git fetch origin --prune --tags

# Stage all changes
echo "Staging all changes..."
git add -A

# If there are staged changes, commit them
if ! git diff --cached --quiet; then
  if [[ -z "$COMMIT_MSG" ]]; then
    TIMESTAMP=$(date -u +"%Y-%m-%d %H:%M:%SZ")
    COMMIT_MSG="chore: update $(git rev-parse --abbrev-ref HEAD) @ ${TIMESTAMP}"
  fi
  echo "Committing changes: ${COMMIT_MSG}"
  git commit -m "${COMMIT_MSG}"
else
  echo "No changes to commit."
fi

CURRENT_SHA=$(git rev-parse --verify HEAD)
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD || echo "(detached)")

echo ""
echo "Pushing HEAD (${CURRENT_SHA}) to remote branches: ${BRANCHES[*]}"
for branch in "${BRANCHES[@]}"; do
  echo ""
  echo "Pushing to 'origin/${branch}'..."
  # Use safe push by default. If force mode provided, append it.
  if [[ -z "$FORCE_MODE" ]]; then
    # Try a normal push via refspec (this will create the branch if missing)
    if git push origin "HEAD:refs/heads/${branch}"; then
      echo "Successfully pushed to origin/${branch}"
    else
      echo "Failed to push to origin/${branch} (remote may have diverged)."
      echo "Run: git fetch origin && git log --graph --oneline --decorate HEAD..origin/${branch} to inspect differences."
      echo "If you want to overwrite remote, re-run with --force-with-lease or --force."
      # continue to next branch
    fi
  else
    # Force mode chosen
    if git push ${FORCE_MODE} origin "HEAD:refs/heads/${branch}"; then
      echo "Force-pushed to origin/${branch} (${FORCE_MODE})"
    else
      echo "Force push failed for origin/${branch}"
    fi
  fi
done

echo ""
echo "All done."
echo "Local branch: ${CURRENT_BRANCH}"
echo "Pushed commit SHA: ${CURRENT_SHA}"
echo "If you want to set local branch tracking for a created branch, run:"
echo "  git branch --set-upstream-to=origin/<branch> <branch>"

# End of script
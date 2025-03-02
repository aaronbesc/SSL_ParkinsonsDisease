## Branching

This project follows the feature branch workflow:

### Branch Structure
- `main`: contains reviewed, stable code.
- `feature/*`: used for adding new functionality (e.g., `feature/keypoint-tracking`).
- `hotfix/*`: used for bug fixes (e.g., `hotfix/fix-json-save`).

### Workflow
1. Create a feature or hotfix branch from `main`:
   ```bash
   git checkout main
   git pull origin main
   git checkout -b feature/new-feature
2. Work on the feature, commit changes, and push the branch:
   ```bash
    git add .
    git commit -m "[Feature] Implement keypoint tracking (#5)"
    git push origin feature/new-feature
3. Open a Pull Request (PR) to merge into main.
4. Wait for a review before merging (at least one approval required).
5. Merge only when approved and all required checks have passed.

### Please see:
- [Good Commits](https://cbea.ms/git-commit/) A lesson from CBeams.
- [Customizing Git](https://git-scm.com/book/en/v2/Customizing-Git-Git-Configuration) 8.1 Customizing Git - Git Configuration.
- [PEP 8 Style](https://peps.python.org/pep-0008/) Style Guide for Python Code.


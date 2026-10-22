#!/usr/bin/env bash
# Headroom: always-on for Claude Code on this Mac/Linux machine (every project).
# Run:  bash headroom-setup.sh
set -euo pipefail

echo "1/5  uv (Python tool installer)"
if ! command -v uv >/dev/null 2>&1; then
  curl -LsSf https://astral.sh/uv/install.sh | sh
fi
export PATH="$HOME/.local/bin:$PATH"

echo "2/5  Headroom"
uv tool install --python 3.13 "headroom-ai[all]" --force
headroom --version

echo "3/5  Usage beacon off"
for rc in "$HOME/.zshrc" "$HOME/.bashrc"; do
  [ -f "$rc" ] && ! grep -q HEADROOM_BEACON "$rc" && echo 'export HEADROOM_BEACON=off' >> "$rc"
done
export HEADROOM_BEACON=off

echo "4/5  Claude Code: route every session through Headroom (user scope)"
headroom init -g claude

echo "5/5  Check"
headroom doctor
echo
echo "Done. Restart Claude Code. Undo any time: headroom unwrap claude"

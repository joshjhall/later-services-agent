#!/usr/bin/env bash
# install-pandoc.sh: install a pinned pandoc release into ~/.local/bin.
# `just docs` (docs/build_overview.py) needs it. The base image has no pandoc,
# and apt needs root, so use the upstream static binary, verified by sha256.
# Idempotent: does nothing when the pinned version is already installed.

set -euo pipefail

VERSION="3.14"
declare -A SHA256=(
    [amd64]="c5f4720cdefb3f7bdc5d07202ef579feef0d1370773c873804dd8fdaa8c4f1b8"
    [arm64]="c692f3d78a415741bbbac4cdbbbe26fa7edca1f43d2301b982fbf4009cc8cf7f"
)
DEST="${HOME}/.local/bin"

if command -v pandoc >/dev/null && pandoc --version | head -1 | grep -qx "pandoc ${VERSION}"; then
    echo "    pandoc ${VERSION} already installed"
    exit 0
fi

case "$(uname -m)" in
    x86_64) arch=amd64 ;;
    aarch64 | arm64) arch=arm64 ;;
    *)
        echo "ERROR: no pandoc build for $(uname -m)"
        exit 1
        ;;
esac

tarball="pandoc-${VERSION}-linux-${arch}.tar.gz"
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT

curl -fsSL -o "${tmp}/${tarball}" \
    "https://github.com/jgm/pandoc/releases/download/${VERSION}/${tarball}"
echo "${SHA256[$arch]}  ${tmp}/${tarball}" | sha256sum -c --quiet -
tar -xzf "${tmp}/${tarball}" -C "$tmp"

mkdir -p "$DEST"
install -m 0755 "${tmp}/pandoc-${VERSION}/bin/pandoc" "${DEST}/pandoc"
echo "    installed $("${DEST}/pandoc" --version | head -1) to ${DEST}"

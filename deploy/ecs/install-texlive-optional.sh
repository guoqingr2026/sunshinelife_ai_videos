#!/usr/bin/env bash
# Optional: enable MathTex/Tex on ECS (large download ~200MB+)
set -euo pipefail
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get install -y -qq texlive-latex-base texlive-latex-extra texlive-fonts-recommended dvipng
echo "texlive installed. MathTex/Tex available for custom_python scenes."

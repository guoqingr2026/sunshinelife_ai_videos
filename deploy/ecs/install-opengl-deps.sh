#!/usr/bin/env bash
# Optional: enable ThreeDScene / OpenGL rendering on headless ECS (xvfb + Mesa)
set -euo pipefail
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get install -y -qq xvfb libgl1-mesa-glx libgl1-mesa-dri libegl1-mesa
echo "OpenGL deps installed. 3D templates use --renderer opengl with xvfb-run."

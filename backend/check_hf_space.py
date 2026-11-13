"""Inspect a Hugging Face Gradio Space's API before connecting AR's AI.

Usage: python backend/check_hf_space.py owner/space-name
This script does not request generation, reserve GPU, or incur GPU usage.
"""
import argparse
import re
import sys


def main():
    parser = argparse.ArgumentParser(description="Read Gradio API schema (no inference)")
    parser.add_argument("space", help="Hugging Face owner/space-name")
    args = parser.parse_args()
    if not re.fullmatch(r"[A-Za-z0-9_-]+/[A-Za-z0-9_.-]+", args.space):
        parser.error("Use owner/space-name, not a URL")
    try:
        from gradio_client import Client
        client = Client(args.space, verbose=False)
        info = client.view_api(return_format="dict")
    except Exception as exc:
        print(f"Could not inspect Space: {type(exc).__name__}: {exc}", file=sys.stderr)
        return 1
    print("Space:", args.space)
    print("API schema (no video generated):")
    print(info)
    print("\\nNEXT: Confirm image input, prompt input, endpoint name and MP4 output.")
    print("Do not configure HF_IMAGE_API_NAME until the actual signature matches.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

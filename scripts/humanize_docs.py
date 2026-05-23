#!/usr/bin/env python3
"""Shared humanize library re-export (backward compatible)."""
from humanize_lib import WORD_REPLACEMENTS, clean_front_matter, humanize

__all__ = ["WORD_REPLACEMENTS", "clean_front_matter", "humanize"]

if __name__ == "__main__":
    from humanize import main

    main(["minimal"])

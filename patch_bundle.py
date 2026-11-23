#!/usr/bin/env python3
"""Refuse the old bytecode offsets, which overwrite Write Canvas content."""

raise SystemExit(
    "Refusing to patch the AAB: the previous offsets do not point to the "
    "audio settings and remove Write Canvas content. A matching mobile UI "
    "source/build is needed to remove only the ASMR settings safely."
)

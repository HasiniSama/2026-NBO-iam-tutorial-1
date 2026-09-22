/*
Copyright (c) 2026, WSO2 LLC. (http://www.wso2.com). All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

/**
 * Display names for the agents that book on a user's behalf. Presentation only:
 * the agent ID itself is the `act.sub` of a verified OBO/CIBA token.
 */

const ENTRY_SEPARATOR = ",";

/** Malformed entries are skipped: a typo in .env must not stop bookings. */
function parseDisplayNames(raw: string | undefined): Map<string, string> {
    const names = new Map<string, string>();

    for (const entry of (raw ?? "").split(ENTRY_SEPARATOR)) {
        const separatorIndex = entry.indexOf("=");

        if (separatorIndex <= 0) {
            continue;
        }

        const agentId = entry.slice(0, separatorIndex).trim();
        const name = entry.slice(separatorIndex + 1).trim();

        if (agentId && name) {
            names.set(agentId, name);
        }
    }

    return names;
}

let displayNames: Map<string, string> | null = null;

/** Parsed on first use, not at module load, since server.ts reads .env later. */
function getDisplayNames(): Map<string, string> {
    if (!displayNames) {
        displayNames = parseDisplayNames(process.env.AGENT_DISPLAY_NAMES);
    }

    return displayNames;
}

/** The display name for an agent ID, or null so callers fall back to the ID. */
export function resolveAgentName(agentId: string | null | undefined): string | null {
    const trimmedId = agentId?.trim();

    if (!trimmedId) {
        return null;
    }

    const mapped = getDisplayNames().get(trimmedId);

    if (mapped) {
        return mapped;
    }

    // Single-agent deployments need no map; the map still wins for IDs it lists.
    const fallback = process.env.AGENT_DISPLAY_NAME?.trim();

    return fallback || null;
}

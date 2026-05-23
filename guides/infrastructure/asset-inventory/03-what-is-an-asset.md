---
module: Asset Inventory
sidebar: Infrastructure → Asset Inventory
page: 03-what-is-an-asset.md
title: "What an asset is in this context"
last_updated: 2026-05-23
---

# What an asset is in this context

**Sidebar path:** Infrastructure → Asset Inventory

## What an asset is in this context

### What you are looking at

In HABIBI-SIEM, an asset is a row in the inventory table representing a managed infrastructure endpoint: servers, gateways, jump hosts, and security tooling. Each row displays a human-readable name (e.g., `PROD-DC-01`), a type classification (`Domain Controller`, `Web Server`, `VPN Gateway`), the primary IP address, an **OS** string under the name (`Windows Server 2022`, `Ubuntu 22.04 LTS`), and tags visible in the detail panel (`critical`, `auth`, `public`, `dev`). The demo registry includes twelve assets spanning production (`10.0.0.x`), development (`172.16.0.x`), and management (`192.168.1.x`) network segments. Assets are not users, not applications in isolation, and not raw log lines, they are the machines and appliances whose compromise would affect the organisation. Think of assets as entries in a property deed office: each record identifies a piece of infrastructure the organisation owns or operates, with an address (IP), a category (type), and annotations (tags) that tell you how it is used. Logs are visitors passing cameras; assets are the buildings those cameras protect.

### What is happening underneath

Each asset object in `ASSETS` carries: `id` (stable key like `a1`), `name`, `type`, `ip`, `criticality` (integer 1–10), `os`, `tags` (string array), and `cves` (array of CVE ID strings cross-referenced to `CVE_DB`). `ASSET_TYPES` is derived as a unique set of type strings for potential future filtering. At runtime, enrichment adds computed fields: `alertCount`, `critAlerts`, `critLevel` (from `getCriticalityLabel()` returning label and colour), `totalCvss`, `maxCvss`, `riskScore`, `isBlocked`, and `status`. The component never treats ephemeral IPs from alerts as assets, only registered IPs and hostname matches participate. This design mirrors enterprise CMDB practice where assets are curated records, not auto-generated from every DHCP lease.

> **Technical note:** `getCriticalityLabel(n)` maps `n >= 9` to **CRITICAL** (red), `n >= 7` to **HIGH** (orange), `n >= 5` to **MEDIUM** (yellow), else **LOW** (green). These labels appear in the detail panel, not as separate table columns.

### Why this matters

Confusion about what counts as an asset causes duplicated work and missed coverage. If analysts treat every source IP in an alert feed as an asset, the inventory balloons with ISP routers and scanning bots. If they ignore cloud ephemeral instances because only bare-metal servers are registered, container sprawl goes unmonitored. HABIBI-SIEM's model, registered hosts with business metadata; trains the distinction between infrastructure you own and entities you observe in traffic. That distinction drives patch SLAs, monitoring agent deployment, and incident escalation paths.

### Step-by-step walkthrough

1. Open Asset Inventory and scan the **TYPE** column to see the diversity: Domain Controller, Database Server, Web Server, App Server, Mail Server, VPN Gateway, Build Server, SIEM/Monitoring, Backup Server, Jump Host.
2. Click `PROD-DC-01` and read tags `critical` and `auth`: this identifies authentication infrastructure.
3. Compare with `DEV-WEB-01`: type Web Server but tags `dev` and `sandbox`, criticality 3; same technical category, different business weight.
4. Note `MONITORING-01` at `10.0.0.100`: type SIEM/Monitoring, criticality 9, compromise of the watcher is a meta-incident.
5. Observe `JUMP-HOST-01` on `192.168.1.1`: tagged `access` and `network`; pivot point for lateral movement analysis.
6. Filter **CRITICAL** (`criticality >= 9`) and count four assets: two DC/DB tier, VPN gateway, and monitoring server.
7. Identify assets with no CVEs (`PROD-APP-01`, `DEV-BUILD-01`, `MONITORING-01`, `JUMP-HOST-01`): patch intelligence is empty, not affirmatively clean.
8. Return to **ALL** and sort by **CRITICALITY** to see the default ordering the component applies when no other sort is selected.

### Common questions

#### Are cloud resources like s3 buckets or lambda functions assets here?

Not in the current demo registry. The twelve assets are traditional the server gateway archetypes. In a full deployment, object stores and serverless functions would appear as asset types with appropriate tags (`cloud`, `data`, `public`). The UI table structure accommodates any `type` string; the limitation is data population, not display capability.

#### Why do some web servers share CVE-2023-44487 but have different criticality?

`PROD-WEB-01` and `PROD-WEB-02` both carry the HTTP/2 Rapid Reset CVE, but they share criticality 8 because they serve the same production tier. `DEV-WEB-01` also has that CVE but criticality 3 because dev exposure is tolerated differently. CVE equality does not imply equal business criticality, tags and criticality encode context CVE lists alone cannot.

#### What is the SIEM/Monitoring asset doing in the inventory?

`MONITORING-01` represents the SOC's own visibility stack. Including it teaches protect the protector thinking: if attackers disable or blind the SIEM, downstream detections fail silently. Its criticality 9 and empty CVE list remind teams to patch and harden monitoring infrastructure even when vulnerability scanners focus on production apps.

#### Can one physical server be multiple assets?

The demo uses one record per logical role/IP. A hypervisor hosting ten VMs would typically be ten assets (or one hypervisor plus ten guest records) depending on CMDB granularity. HABIBI-SIEM does not model parent/child relationships; each row is flat.

### How an analyst uses this during active incident

The analyst maps alert IPs to asset records to determine incident scope. Seeing alerts against `10.0.0.20` (`PROD-WEB-01`, tags `public`, `internet`) suggests an external-facing attack surface compromise. Alerts against `10.0.0.1` (`PROD-DC-01`) imply identity infrastructure is targeted; they escalate to identity team and check for CVE-2023-23397 (Outlook NTLM leak) and CVE-2021-34527 (PrintNightmare) listed on that asset. They verify whether `PROD-VPN-GW` (`10.0.0.50`, CVE-2023-20269) shows **AT-RISK** status, indicating possible VPN bypass exploitation. Asset type and tags inform which runbooks to open without re-querying CMDB systems under time pressure.

### Edge cases and gotchas

Hostname matching (`a.name.toLowerCase().includes(al.host.name.toLowerCase())`) can fail silently if logs omit `host.name`. Assets without alert correlations always show **CLEAN** even if they are vulnerable; status reflects detection, not posture. The registry includes no workstations or IoT devices; real environments would, and their absence here is a demo simplification. Duplicate IPs in the registry would break row keys, the static data prevents this, but CMDB imports must deduplicate.

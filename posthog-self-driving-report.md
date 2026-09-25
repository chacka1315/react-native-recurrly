# PostHog Self-driving setup report

## Summary

PostHog Self-driving is configured for this mobile subscription-tracking app. Session Replay and Error Tracking were already enabled, Support was enabled, and health, error-tracking, and support signal sources were switched on. Findings should begin appearing in the [Self-driving inbox](https://eu.posthog.com/project/284390/inbox) within about 30 minutes.

## AI data processing

Approved by the organization-level wizard gate.

## GitHub

The PostHog GitHub App was already connected before this setup.

## Products enabled

| Product | Result | Notes |
|---|---|---|
| Session Replay | Already enabled | This is a React Native/Expo app, so the server switch requires working mobile replay capture. No recordings exist yet; verify it on a real device. |
| Error Tracking | Already enabled | The mobile app already calls `captureException` in its authentication flows. |
| Support (Conversations) | Enabled | Tickets begin arriving only after an inbound email, inbox, or Slack channel is connected in PostHog. |

## Signal sources

| Signal source | Action | Details |
|---|---|---|
| `health_checks` / `health_issue` | Enabled | Source id `01a0d962-87c5-7415-8eb0-3e848bee3022`. |
| `error_tracking` / `issue_created` | Enabled | Source id `01a0d962-87f3-7a46-a041-50c75eadf8b3`. |
| `error_tracking` / `issue_reopened` | Enabled | Source id `01a0d962-87c6-7a59-8bb4-7abd2b23b41f`. |
| `error_tracking` / `issue_spiking` | Enabled | Source id `01a0d962-88cb-7caf-a913-4e474ec3a8e7`. |
| `conversations` / `ticket` | Enabled | Source id `01a0d962-88f5-7646-ace0-d888c80f78bf`; dormant until an inbound support channel is connected. |
| `signals_scout` / `cross_source_issue` | On by default | No opt-out row existed, so no row was created. |
| Session Replay source row | Deliberately skipped | Replay Vision scanners below are the dedicated Self-driving route for replay findings. |

## Connected tools

No optional issue tracker, error tracker, support desk, database-performance, security-scanner, feedback, review, or search-analytics tool was selected. No external warehouse sources were detected. Their responder rows were left untouched.

## Scout troop

**Active scouts (3):**

| Scout | Why it is active |
|---|---|
| General | Watches cross-product patterns outside a specialist’s scope. |
| Product analytics | The app captures authentication and subscription-interaction events, making core product-flow coverage the strongest specialist fit. |
| Observability gaps | Detects meaningful event activity that has no insight, dashboard, or alert coverage. |

**Disabled scouts (24):**

| Scout | Why it is disabled |
|---|---|
| AI observability | No LLM traces or AI surface were found. |
| Anomaly detection | No established dashboards or insights were found for it to monitor. |
| APM | No distributed tracing surface was found. |
| Conversations | Support is newly enabled but has no inbound channel or ticket activity yet. |
| CSP violations | No CSP reporting configuration was found. |
| Customer analytics | No account/group analytics surface was found. |
| Data pipelines | No CDP destination, batch export, or Hog flow was found. |
| Data warehouse | No warehouse source was connected. |
| Error tracking | Covered by the native error-tracking signal sources. |
| Experiments | No active experiments were found. |
| Feature flags | No feature-flag usage was found. |
| Inbox validation | Fresh setup; there are no resolved reports to validate yet. |
| Insight alerts | No configured insight alerts were found. |
| Logs | No PostHog logs product evidence was found. |
| MCP tool calls | No project MCP telemetry surface was identified. |
| Replay Vision | No accumulated scanner observations existed before this run. |
| PR follow-up | No deployed Self-driving fixes exist to check yet. |
| Revenue analytics | The app tracks subscriptions but no payment SDK or revenue data source was found. |
| Session replay | Covered by the Replay Vision scanners configured below. |
| Skills store | No project skill-store maintenance surface was identified. |
| Surveys | No surveys were found. |
| Tasks | No PostHog Tasks surface was identified. |
| Web analytics | This is a mobile app, not a web-traffic surface. |
| Web vitals | This is a mobile app, not a web-vitals surface. |

**Run budget:** 100 runs/day maximum; 0 used and 100 remaining when configured. The current early-access notice says: “Scouts are in early access. Each project gets up to 100 scout runs a day. Contact team-self-driving@posthog.com if you need more.”

## Custom scouts

No custom scouts were created. Two candidates were proposed and declined:

- **Account setup and email verification:** a dedicated check for a sustained setup-completion drop, verification retry spike, or recurring verification failures. The generic product-analytics scout partially covers conversion, but not this named mobile authentication flow.
- **Subscription-detail engagement:** a check for subscription-detail interactions going quiet or unusually low while visits continue. It partially overlaps generic product analytics, but targets the app’s core subscription-management affordance.

The native error-tracking source and Replay Vision scanners already own error and replay coverage, respectively. If a future custom scout is noisy, set `emit: false` on its config in PostHog to keep it in dry-run mode.

## Replay Vision scanners

A scanner is an LLM that watches individual session recordings on a schedule and pushes qualifying findings to the Self-driving inbox. These are the only parts of this setup that spend Replay Vision quota. Findings arrive at half weight and require corroboration before promotion into a report.

| Monitor | Status | What it watches | Query scope | Sampling | Estimate |
|---|---|---|---|---:|---:|
| Account setup breakage | Created | Visible failures in account creation and email verification, including unresponsive actions, failed verification, blank authentication screens, and failure to reach the renewal dashboard. | Recordings whose current URL contains `/register`; registration is the app’s identifiable account-setup completion flow. | 50% | 0 observations/month, 0 credits/month at creation. |
| Subscription app frustration | Created | Visible struggle while registering, signing in, entering or resending verification codes, finding subscriptions, or opening renewal details. | Recordings containing `$rageclick` only. | 100% | 0 observations/month, 0 credits/month at creation. |

No recordings existed at setup time. Both monitors are armed and will begin working when session recordings arrive. The organization had 2,500 Replay Vision credits remaining and was not exhausted when the scanners were created.

## Follow-ups

- [ ] Connect an inbound Support/Conversations channel (email, inbox, or Slack) in PostHog so the enabled ticket responder has data.
- [ ] Verify Session Replay records a real Expo/React Native device session. The project had zero recordings when checked; the server product switch alone does not prove mobile replay capture is operating.
- [ ] Once recordings exist, confirm the account-setup monitor matches mobile registration sessions. It uses the app’s `/register` route as the completion-flow scope.

## Files modified or created

- Created `posthog-self-driving-report.md` (this report).
- Tool-managed workflow skills were installed under `.claude/skills/` to perform the Replay Vision setup; application source files were not changed.

## What happens next

Fresh scout configurations are picked up by the coordinator within about 30 minutes and draw from the daily run budget. Replay Vision monitors begin scanning as new recordings complete. Findings cluster into reports in the [Self-driving inbox](https://eu.posthog.com/project/284390/inbox); immediately actionable reports can start coding tasks.

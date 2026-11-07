# Hippo World Tour source export

App version: 1.5.0.
Code provenance: local source commit c6728c69134503ba71fc0b3c814d0be595add511. The validation document was updated after that commit to record the publication blocker. The exported hosting manifest omits the original Site identity.

This package includes the complete personality quiz at /quiz. All 123 automated tests, TypeScript and the production Worker build passed. Browser checks covered desktop and narrow phone layouts, saved progress, keyboard controls, editable review, traits, sharing, friend comparisons and a real PNG download.

Publishing this release to the linked Site was blocked by HTTP 503 from its source service. The previous hosted Site remains unchanged. This source package is ready for your GitHub setup using docs/GITHUB_SETUP.md. It is a server application and requires the documented Worker/database setup. There are no additional database migrations for version 1.5.

No credentials, private runtime state, Git metadata, node_modules or built output are included. Optional live data providers still require authorized configuration. Quiz scores are fictional personal matches, not popularity rankings.

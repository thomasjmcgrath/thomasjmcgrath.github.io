# News source and update contract

The Bloat Bulletin combines eight curated, source-checked entries with new matching public publisher headlines. Sources were checked November 6, 2026. See content/news.json for the original publication dates and direct links. Undated venue pages remain explicitly undated. Articles older than 90 days receive an archive badge. A retrieval date never replaces an original publication date.

Publisher allowlist: Thai PBS World, Cincinnati Zoo, Metro Richmond Zoo, Toronto Zoo, Wingham Wildlife Park and Zoo de Mulhouse. Curated reporting also credits PEOPLE, and Toni’s historical arrival credits the Mulhouse Alsace Agglomération magazine. The two reporting outlets are identified separately from official animal-care institutions.

The updater retrieves six allowlisted public indexes. RSS entries must have a valid nonfuture publication date, a canonical HTTPS article link on that publisher’s exact host, a relevant animal name and hippo context. HTML discovery is limited to named relevant links and two candidate article reads per publisher. Toronto’s current press-release archive link is discovered from its media room rather than changing the source deployment each year. Article metadata or an explicit publication date is required before an automatic story is accepted. XML entity declarations are rejected. No article HTML is rendered and external images are not copied.

New feed matches are published as attributed headlines only, labelled automatic matches. Owner controls can hide irrelevant stories. If a retained headline or its original date/animal mapping changes, its old payload remains visible with a review notice. The proposed headline waits for an explicit owner approval. Curated summaries are not overwritten by automatic matches.

GET /api/news returns visible stories and news retrieval status. The optional owner view requires the existing trusted signed-in owner identity. Owner mutations use /api/admin, check identity and same-origin requests, and never fetch arbitrary user-supplied URLs.

Routine POST /api/maintenance and refresh_hippo_sources update news data as well as existing visitor-source checks. Successful news index checks are cached six hours, failed attempts one minute. Last successes and retained stories survive failed refreshes. The linked daily source automation already covers this endpoint. No duplicate task or schedule change is needed. get_hippo_source_status and GET /api/maintenance include news read-back.

Source access is not universal. Cincinnati and Metro Richmond RSS URLs returned HTTP 403 from the authoring environment. This is a retrieval limitation, not proof that their sites are down. Hosted results are verified after deployment and recorded in release verification. Index retrieval with no matches means no relevant story was found in that index window, not no news anywhere. Social-only posts and unreadable or undated candidate articles can be missed.

All news is informational. No feed writes venue overrides, animal residence, viewing windows, fares, ticket inventory or search-interest rankings. Interest data still uses only the separately configured authorized feed.

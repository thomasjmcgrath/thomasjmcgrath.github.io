# Hippo energy personality quiz

Version 1.5.0 adds `/quiz`, linked from the home page, hippo directory, Explore menu and footer. It is a browser-only entertainment feature.

## Experience

The quiz contains twelve prompts: ten four-choice questions and two sliders. A slider's initial middle position is not an answer until the visitor changes it or chooses a preset, including the middle preset. Numeric zero is a valid answer.

Visitors can go back, skip, jump to any question, edit answers in the review and return to the review after an edit. At least eight valid answers are required for a result. Keys 1–4 select a card and Enter continues while the question is focused. Native radio and slider keyboard controls remain available. Animations respect reduced-motion preferences.

Results include:

- A named hippo and one of seven fictional archetypes, with a credited archive image.
- A story, three strengths, a chaos clause, a motto and a suggested style of day out.
- Five interactive trait bars and a radar chart with an optional archetype overlay.
- The two closest personal runners-up, an expanded lineup and a tie explanation when needed.
- A friend's archetype selector with three suggestions for sharing a day out.
- A profile link and existing planner controls, including restrictions for animals with unconfirmed public viewing.
- An archetype link, a copied introduction and a locally generated 1080 × 1400 PNG card.

## Matching

Five dimensions describe the visitor's selected preferences: adventure tempo, social energy, curiosity, planning and spotlight preference. Choices contribute authored values to one or more axes. Each slider contributes twice the weight of one choice on its axis. Answer contributions are averaged per measured axis.

Each hippo archetype has a fictional five-axis profile. Its overlap is 100 minus the mean absolute difference between the visitor's measured axes and that profile, rounded to a whole number. Unmeasured axes are omitted from matching and labelled as unmeasured in the result. At least eight answers are needed. A fixed editorial order breaks equal rounded scores reproducibly, and ties remain visible.

These scores are personal quiz similarities. They are not internet rankings, popularity statistics, clinical findings or measured animal personalities. All seven outcomes are reachable and covered by regression tests.

| Hippo | Fictional archetype |
| --- | --- |
| Moo Deng | The Tiny Chaos Agent |
| Fiona | The Beloved Main Character |
| Fritz | The Side-Quest Specialist |
| Poppy | The Cozy Crowd Favourite |
| Maple | The Thoughtful Trip Architect |
| Haggis | The Independent Explorer |
| Toni | The Creative Headliner |

## Privacy and persistence

Drafts use `hwt-personality-v1` in localStorage, with a bounded, validated versioned payload. The quiz resumes only when the visitor chooses Resume. Retaking replaces the quiz draft after an explicit in-app choice. Other trip, passport, news and analytics preferences are untouched. Storage errors are visible and do not block completing the quiz.

Links use `/quiz?result=<known-hippo-id>&v=1`. They carry no answers, trait scores, names or visitor identifiers. A shared link displays only the authored archetype and invites the recipient to take their own quiz. Current Site access rules still apply. It does not make a private Site public.

The quiz has no server API, database table or analytics event. Opening a real animal profile or using the existing trip planner continues to follow those features' existing privacy rules. The PNG is generated locally from the bundled archive photo and includes attribution. Clipboard permission failures expose a selectable URL fallback.

## Implementation

`lib/quiz.ts` owns prompts, validation, scoring and share helpers. `components/PersonalityQuiz.tsx` owns the interactive flow. `lib/quiz-card.ts` creates the PNG in a canvas. `app/quiz/page.tsx` provides the page and named shared-card metadata. Scoped styles live in `app/quiz/quiz.css`.

No new dependencies or database migrations are required. Animal homes, visitor-source monitoring, flights, authorized interest feeds and daily maintenance continue to use their existing systems.


# mm-web

A component of mythic-mondays. Currently designed as a standalone stateful page.

## Usage

1. Type name of participant.
2. Select one or more preferences. They cannot be added without at least one.
3. Add to list.
4. Click participant's name on left-hand side to remove.
5. Willing is the lowest preference, preferred is the strongest preference.
6. The system will attempt to sort participants into teams.
7. While role-selection is not random, the team assignments are.
8. Refresh to reset all participants.

## Caveats

* Preference of participants with 3 roles selected is currently ignored. That is, 3-way flex participants are randomized.
* Closing or refreshing the page will clear the list of participants.

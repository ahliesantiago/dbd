Please initialize a project with the following specifications:

Tech stack:
- Front-end: React with Next.js
    - Mobile responsive for PWA use (eventual shift to React Native or Expo)
- Back-end: Node.js with Express
- TypeScript
- PostgreSQL (or hybrid with MongoDB/JSON fields with GraphQL)

What is the project:
An app for visually planning days (weekly, monthly, and daily), specifically tasks and "events", routines, habits, etc., plus a journal feature.

This is targetted for individuals with ADHD and/or hyperactive and multitasking tendencies who desires visual organization to function effectively and to stay productive, offering a customizable view and flexible view of features and their tasks.

Initial features:
- [x] Upon first launch of the app: prompt for user's Name (add a note that this can simply be an alias)
- [ ] Add an optional user authentication -- since this is for personal use, there will only be one user. The authentication will simply be for protecting the data, i.e. wrong email or username and password will not allow access into the app to protect the contents.
  - [ ] The user can still reset their password (intentional, or Forgot Password) and change their email, username, and their provided name/alias as desired (as long as they can provide their old credentials or reset through their linked email address)
  - No option to add or sign up as another user once the app instance is tied to a specific user (unless they reset the entire app/database, which is not needed for now).
  - [ ] Again, this is optional - if the user opts to skip, the data will simply not be password-protected.
- [x] Overall theme:
  - [x] please feel free to select colors that would complement well + gives a sense of productivity
  - [x] have a light and dark mode
- [x] Pages and Navigation:
  - [x] navigation bar
    -[x]  on desktop/browser: sidebar
    - [x] on mobile: bottom nav bar
    - [x] mobile view options: Home icon (for Dashboard), Blocks, Calendar, Templates, Settings (limited due to space constraints on mobile)
  - [x] list of other pages:
    - [x] Planning
    - [x] Journal Entries
- [x] Dashboard
  - [x] Welcome, [name]!
    - [ ] Welcome greeting can change: Good morning, Good afternoon, Good evening (depending on device/local time) or generic: Welcome, Good day, etc. (randomize)
  - [x] grid display of the pages (icons and page title/name)
  - [ ] On desktop (currently only on desktop - hide this from the mobile dashboard for now) - below the grid icons of the pages:
    - [ ] a view similar to the Daily calendar view where the user can see an overview of their day
    - [ ] time blocked day view (but user can still freely drag and drop blocks to rearrange or reschedule blocks throughout the day)
    - [ ] metrics grid on the right (upper half)
      - [ ] default view: the grid will contain a carousel of the current metrics being tracked; the user can simply fill in their answer for the metric that day, then scroll to move on to the next or view the others
      - [ ] alternative view: the grid will contain icons of the metrics also arranged in grid view and clicking will allow the user to then answer/fill in the metric for that day
    - [ ] journal entry grid on the lower right
- [ ] Blocks
  - blocks will be the app's universal term for tasks, events, and habits
  - required fields:
    - title
    - specify Type of block
      - default Types that cannot be removed (please feel free to fill in their respective descriptions for now):
        - Tasks
        - Habits
        - Events
        - Appointments
  - optional fields:
    - start and end date
    - start and end time
    - status field (this is not visible during creation, during which the status is null or None)
    - description / notes / remarks
    - tags
    - categories
    - priority
      - High, Medium, Low, None (expounded on in Templates below)
      - prioritization can define the default placement of blocks on a calendar view (e.g. High priority blocks are the "main" ones and would be on the left-most in case of overlaps, Medium would be secondary ones if there are higher priority ones, etc.)
        - this can still be overridden by user's custom placement, so an additional hidden field for horizontal positioning/order would still be needed
    - recurrence / repetition
      - one-time
      - recurring
        - specific: 1 or n times daily, weekly, monthly, yearly
        - or just generally recurring (occasional, frequent, etc.)
    - instance completion basis (before a block instance can be counted towards completion statistic)
      - unit and goal
        - examples:
          - simple marking as completed
          - count, duration, distance, percent, etc. (e.g. 2 times, 10 minutes, 2km, etc.)
- [ ] Blocks page
  - [ ] user can create new blocks from here and the latest blocks will also be listed
- [ ] Calendar page
  - [ ] with a toggle for these views:
    - [ ] Daily
      - [ ] users can reorder the blocks' placement
        - [ ] vertical reordering will be for changing the schedule
          - [ ] they can also be resized (vertically) to change the duration of a block
        - [ ] horizontal reordering is more for visual flexibility, with blocks arrangable in "panes" (column-like) and the block widths adjusting to fit depending on the size of the screen
      - [ ] users can change the status of blocks from here:
        - [ ] Mark as Completed (with a check mark for quick marking)
        - [ ] Skip/Postpone (feel free to recommend a symbol/icon for this)
          - [ ] "Skip" will be for recurring blocks or Habits
            - [ ] block will remain and simply be marked as skipped / not completed, good for historical tracking if desired
          - [ ] "Postpone" will be for one-time blocks
            - [ ] likewise, block will remain but instead of changing the status, the date will be removed
        - [ ] Cancel/Delete (with an 'X' mark)
    - [ ] Weekly
    - [ ] Monthly
    - [ ] Agenda view (just a list of the tasks/events by date)
  - [ ] blocks can be added directly from this view upon clicking on a day or a specific time
    - [ ] with the same UI as the creation of blocks from the Blocks page
  - [ ] blocks with start and end dates but with no start and end time will appear only on the Daily view as follows (i.e., "No Fixed Schedule" sections):
    - [ ] on mobile view, they will appear above the hourly section of the page - [ ] this section will be scrollable and should only show a maximum of 3 of these blocks (kept to one line each (i.e. like 1 block with the shortest duration), truncated if the text is longer), but should only "stretch to fit" (i.e., if there are no blocks displayed here, it should not be visible and the hourly section of the page should take up the full height of the page)
    - [ ] on desktop view, they will appear listed on a collapsible/expandable section on the right of the page
- [ ] Templates page - the below can be viewed and created from this page in their respective subsections
  - [ ] Tags
    - [ ] examples (include by default, but can be removed or modified):
      - [ ] hygiene, skincare, cardio, music, planning
  - [ ] Categories
    - [ ] examples (include by default, but can be removed or modified):
      - [ ] Work, Learning, Chores, Health, Hobby
  - [ ] Types
    - [ ] default Types that cannot be removed (please feel free to fill in their respective descriptions for now):
      - [ ] Tasks
      - [ ] Habits
        - [ ] positive: "goals"
        - [ ] negative: habit being "kicked" - the lower number, the better, e.g. for stopping smoking
      - [ ] Events
      - [ ] Appointments
  - [ ] Metrics
    - [ ] default Metrics that cannot be removed (but can be modified):
      - [ ] Mood (type: rating; default: / 5, icon: smiley)
      - [ ] Hydration (type: rating; default: / 8; icon: glass or water)
      - [ ] Weight (type: number; default unit: kg)
      - [ ] Sleep (type: number; default unit: hours)
  - [ ] Priorities
    - [ ] default (but can be modified), from highest to lowest: High, Medium, Low, None
    - [ ] user can edit the default ones and add additional ones and they would need to define the order
    - [ ] actual "priority" order can be defined by hidden number field
  - [ ] Schedule templates
    - [ ] show as an additional option here (clickable like the ones above) but upon clicking, show a work in progress / coming soon splash page for now
- [ ] Settings page
  - [ ] initial settings:
    - [ ] Blocks:
      - [ ] users can set the default duration of "blocks" from here
      - [ ] set how to deal with blocks marked as completed and those marked as skipped (separately):
        - [ ] hide/remove from Day view
        - [ ] cross and gray out
        - [ ] nothing (keep as is)
- [ ] Planning page
  - [ ] a view similar to the Daily calendar view where the user can quickly add blocks (those tagged as recurring (any type), and those of Habits type) to a day (drag and drop)
  - [ ] the blocks are displayed on the left of the calendar (Day) view
    - [ ] dragging and dropping onto the calendar will set the start time depending on where it is placed (and the end time will be set depending on the default duration setting)
    - [ ] dragging and dropping to the "No Fixed Schedule" sections will set no start and end times
- [ ] Journal Page
  - [ ] a chronological view of the user's journal entries
  - [ ] can toggle between list and calendar view
  - [ ] in list view, the journal entries are each wrapped in a post-it note-like background
  - [ ] in calendar view, the dates with journal entries will be highlighted somehow (ie a differently-colored circle around the number)

These features should be implemented one by one, and I would like to review and save each step first before proceeding to the next step. Exceptions would be very closely related features or configurations.

Eventual/Future features planned (no need to implement yet, but just good to keep in mind in case considerations need to be made for these):
- Ability to connect/relate/associate blocks
  - nest (sub-blocks / parent-children)
    - in Day view, the child block/s may appear "within the parent block"
      - parent may need to be clicked first, or
      - both clickable from day view, with some slight horizontal indents or misalignment to allow dedicated clicking if the start and end times exactly overlap (block above would be semi-transparent / have low opacity)
  - simple relation / linking / sibling
- Optional grouping and tracking of blocks by "Goal" and/or "Project"
- Schedule templates: "routines", schedules, or tasks "bundled" together based on focus (i.e. by category or some other grouping) or mood e.g. in a creative mood / want to focus on art or reading, or rest and gaming, or work and studying, or workout, social, etc.
- Ability to quick-plan days with set templates
- Stats for completion of recurring tasks, habits, metrics, etc.
  - Track rate/number of completion, time spent or accomplished, etc.
  - Progress views
    - charts, heatmaps
    - weekly, monthly, yearly
    - by recurring task or habit, by period, by category, etc.
- Block ratings: user can "rate" to express how they feel about the block/entry upon completion or can "grade" or "score" tracked entries - may reflect in charts through color (heatmap), or height (line chart), etc.
- Pomodoro option for blocks with start and end time - have start, pause, and end (finish or cancel)
  - can be used to track completion rate or speed
- Task title completion/suggestions based on historical tasks, but user can also remove tasks names/titles from suggestions
- Two-way syncing with external calendars
- Customizable theme (colors)

Prompt:

Please proceed with initializing this project with these specifications.

As mentioned in the file, please feel free to ask confirmation questions instead of making up context. PLEASE, do not make up context. PLEASE don't make decisions for the app -- ASK.

And again, the features should be implemented one by one, bit by bit, to prevent any potential major issues while retaining good updates.

# 2. Actors and User Stories

This artifact outlines the actors of the system and their user stories. It serves as a guide of the design and development process, ensuring that the project's requirements are met.

## 2.1. Actors

Figure 1 displays the actors for the TripTally system, which are described in Table 1.

<img width="311" height="338" alt="actors_v1 drawio" src="https://github.com/user-attachments/assets/e0abb447-d9b7-4990-ad5e-7dd93c9dbd4e" />

*Figure 1: TripTally actors*

| **Identifier** | **Description** |
|----------------|-----------------|
| **User** | A general actor representing anyone who can interact with the public features or information of the system. |
| **Guest** | An unauthenticated user who can browse public pages and is able to register or sign in. |
| **Authenticated User** | A user who has logged into the system and can access personalized features. |
| **Traveler** | An authenticated user who creates and manages trips, including itineraries, expenses, packing lists and privacy settings. |
| **Collaborator** | An authenticated user invited to a trip. May view and contribute to trip details within the permissions granted by the Traveler. |
| **Administrator** | An authenticated user with full system privileges: user management, system settings, monitoring, and maintenance tasks. |

*Table 1: TripTally actors description*

## 2.2. User Stories

The following sections contain the user stories for the actors of the TripTally system.

### 2.2.1. User

| ID | Name | Priority | Description |
|----|------|----------|-------------|
| US001 | Browse Public Trip Pages | High | As a User, I want to browse through public trip pages, so that I can explore how other travelers organize their trips before creating my own. |
| US002 | Search Trips | High | As a User, I want the ability to search for any trip, so I can easily find what I am looking for. |
| US003 | View Trip Details | High | As a User, I want to view the details of a specific trip, so that I can understand its itinerary, expenses, and structure before deciding to create my own. |
| US004 | About Us | Medium | As a User, I want an 'About Us' page, so I can learn about the people behind the website. |
| US005 | Contacts | Medium | As a User, I want to have a 'Contacts' page, so I can reach out to the people responsible for the platform. |
| US006 | View User Profiles | Medium | As a User, I want to view other users' profiles, so that I can connect with users with similar travel interests. |
| US007 | Read Traveler Testimonials | Low | As a User, I want to read about other travelers’ experiences or testimonials, so that I can trust the usefulness of TripTally before signing up. |

### 2.2.2. Guest

| ID | Name | Priority | Description |
|----|------|----------|-------------|
| US101 | Login | High | As a Guest, I want the ability to log in the system, so that I can access my personal profile. |
| US102 | Registration | High | As a Guest, I want the option to register an account, so that I can create and manage my own trips and access personalized travel features. |
| US103 | Recover Password | Medium | As a Guest, I want the ability to recover my password, so I can regain access to my account. |

### 2.2.3. Authenticated User

| ID | Name | Priority | Description |
|----|------|----------|-------------|
| US201 | Logout | High | As an Authenticated User, I want the ability to log out of the system, so that I can securely end my session and protect my account. |
| US202 | View Profile | High | As an Authenticated User, I want to view my profile, so I can understand what other users can see about me. |
| US203 | Edit Profile | High | As an Authenticated User, I want to be able to edit my personal information, so I can keep my information up-to-date. |
| US204 | Create Traveler Profile | High | As an Authenticated User, I want create a Traveler, so that I can use personalized travel features like AI trip planning, packing list suggestions, and trip history tracking. |
| US205 | Edit Settings | Medium | As an Authenticated User, I want to manage my account settings (e.g., language, currency, traveller profile), so that the app feels personalized. |
| US206 | Delete Account | Medium | As an Authenticated User, I want the option to delete my account, so I can protect my privacy. |
| US207 | Support Profile Picture | Medium | As an Authenticated User, I want the ability to set a profile picture, so other users can easily recognize me. |
| US208 | View Personal Notifications | Medium | As an Authenticated User, I want to view notifications about my trips (e.g., flight delays, itinerary changes, collaborator updates), so I can stay informed and adjust my plans accordingly. |
| US209 | Save Other Users’ Trips | Medium | As an Authenticated User, I want to save trips created by other users, so that I can revisit them later for inspiration or planning my own trips. |
| US210 | Multi-Channel Notifications | Medium | As an Authenticated User, I want to receive notifications both in the app and by email, so that I can stay informed even when I’m not actively using TripTally.
| US211 | Configure Notification Preferences | Medium | As an Authenticated User, I want to configure what types of notifications I receive (e.g., flight updates, trip plan changes, collaborator actions) and by what channel, so that I am only alerted about what matters to me. |


### 2.2.4. Traveler

| ID | Name | Priority | Description |
|----|------|----------|-------------|
| US301 | Create New Trip | High | As a Traveler, I want to create a new trip with name, dates, and home currency, so that I can start tracking and organizing my travel. |
| US302 | Select Trip Locations | High | As a Traveler, I want to select one or more locations when creating a trip, so that I can plan and organize my itinerary across multiple destinations. |
| US303 | Add Trip Expenses | High | As a Traveler, I want to add expenses with category, vendor, and amount, so that I can track my spending accurately. |
| US304 | View Expense Summary | High | As a Traveler, I want to see total expenses by category and currency, so that I can understand my spending patterns. |
| US305 | Add Flight Segment | High | As a Traveler, I want to add a flight segment by airline and flight number, so that I can track its status during my trip. |
| US306 | Share Trip Publicly | High | As a Traveler, I want to share my trip publicly while controlling what information is visible, so that I can protect my privacy. |
| US307 | Upcoming Trips | High | As a Traveler, I want my to display my upcoming trips, so that I can quickly see what’s planned and access trip details. |
| US308 | Quick Access to Trip | High | As a Traveler, I want to click a trip on the profile and go directly to its dashboard, so that I can manage itinerary, expenses, and notifications efficiently. |
| US309 | AI Trip Plan Suggestion | High | As a Traveler, I want the platform to suggest a trip plan based on the information I provide (destinations, dates, preferences), so that I can have a ready-to-use itinerary to start with. |
| US310 | Add Must-Visit Locations | High | As a Traveler, I want to input my must-visit restaurants, attractions, or locations, so that the AI plan incorporates these preferences into the itinerary. |
| US311 | Accept and Edit AI Plan | Medium | As a Traveler, I want to accept the AI-generated trip plan and make changes to it (add/remove activities, adjust timings), so that the plan fits my personal preferences and needs. |
| US312 | Dynamic Trip Plan Updates | Medium | As a Traveler, I want the AI to suggest alternative plans if there are changes in flights, weather, or time spent at a location, so that my itinerary always remains optimal and feasible. |
| US313 | Plan Change Notifications | Medium | As a Traveler, I want to receive notifications when the AI suggests changes to my trip plan, so that I can review and apply the recommended adjustments promptly. |
| US314 | View Trip Plan on Map | Medium | As a Traveler, I want to view the updated trip plan on a map, so that I can visualize the route, destinations, and sequence of activities. |
| US315 | Receive Flight Updates | Medium | As a Traveler, I want to receive live flight updates, so that I’m informed of delays or schedule changes in real time. |
| US316 | Weather Change Updates | Medium | As a Traveler, I want to receive notifications about weather changes at my destination, so that I can adjust my packing, activities, or travel plans accordingly. |
| US317 | Smart Packing List | Medium | As a Traveler, I want a smart packing list to suggest items automatically based on my trip type, destination, and weather, so that I can save time and pack appropriately. |
| US318 | Profile-Based Packing Recommendations | Medium | As a Traveler, I want the packing suggestions to consider my traveler profile (preferences, habits, past trips), so that the list is personalized to my needs. |
| US319 | Modify Packing List Items | Medium | As a Traveler, I want to add, remove, or adjust items in the packing list, so that I can customize it according to my personal preferences. |
| US320 | Weather Change Packing Alerts | Medium | As a Traveler, I want to receive notifications when the weather changes at my destination, so that I can add or remove items from the packing list accordingly. |
| US321 | Add Trip Cover Image | Medium | As a Traveler, I want to upload a cover image for my trip, so that I can personalize its appearance and make it easier to identify in my dashboard. |
| US322 | Edit Expenses | Medium | As a Traveler, I want to edit an expense, so that I can correct mistakes. |
| US323 | Remove Expenses | Medium | As a Traveler, I want to remove an expense, so that I can remove outdated data. |
| US324 | View Past Trips | Medium | As a Traveler, I want to view my past trips, so that I can revisit and reflect on previous journeys. |
| US325 | Invite Collaborators | Medium | As a Traveler, I want to invite collaborators, so that others can contribute to shared trip planning. |
| US326 | Track Plan Version History | Medium | As a Traveler, I want to see the history of AI plan suggestions and my edits, so that I can track changes and revert if needed. |
| US327 | Search and Filter Trips | Medium | As a Traveler, I want to search or filter my trips by date, destination, or status, so that I can quickly find and access specific trips in my dashboard. |
| US328 | Switch Trip Currency | Low | As a Traveler, I want to switch the currency of my trip, so that I can view totals in a different currency without losing data. |
| US329 | Visited Countries Map | Low | As a Traveler, I want a section in my profile displaying a map of countries I have visited, so that I can visualize my travel history and achievements. |


### 2.2.4. Collaborator

| ID | Name | Priority | Description |
|----|------|----------|-------------|
| US401 | View Shared Trip Details | High | As a Collaborator, I want to view shared trip details, so that I stay updated with the group’s plans. |
| US402 | Add or Update Shared Expenses | High | As a Collaborator, I want to add or update expenses for shared activities, so that costs are distributed fairly among participants. |
| US403 | Receive Trip Update Notifications | Medium | As a Collaborator, I want to receive notifications about trip updates, so that I’m informed about schedule or plan changes. |
| US404 | View Permissions | Medium | As a Collaborator, I want to see my permissions clearly, so that I know what I can or cannot edit within the shared trip. |
| US405 | Add Comments or Notes | Low | As a Collaborator, I want to add comments or notes to the itinerary, so that I can coordinate effectively with other travelers. |

### 2.2.5. Administrator

| ID | Name | Priority | Description |
|----|------|----------|-------------|
| US501 | Manage User Accounts | High | As an Administrator, I want to manage user accounts (activate, deactivate, or remove), so that the platform remains secure and well-maintained. |

---

## 3. Acceptance Test Cases

This section defines the acceptance criteria and corresponding test cases for each user story. Acceptance tests serve as validation mechanisms to ensure that all functional requirements of the TripTally system are met.

### 3.1 User

Test ID | User Story Ref. | Test Objective / Description | Preconditions | Test Steps | Expected Result
-- | -- | -- | -- | -- | --
ATC001 | US001 – Browse Public Trip Pages | Verify that users can view a list of public trip pages. | User is on the homepage. | 1. Navigate to the “Trips” section. <br>2. Browse available public trips. | List of public trips is displayed with trip names, cover images, and basic details.
ATC002 | US002 – Search Trips | Verify that users can search for trips by keywords or filters. | User is on the “Trips” page. | 1. Enter a keyword in the search bar. <br>2. Click “Search.” | Trips matching the keyword or filter are displayed.
ATC003 | US003 – View Trip Details | Verify that users can open and view a specific trip. | Public trips are available. | 1. Select a trip from the list. | Trip details (itinerary, expenses, participants) are displayed.
ATC004 | US004 – About Us | Verify that users can access the “About Us” page. | User is on the homepage. | 1. Click the “About Us” link. | “About Us” page with company/team information is displayed.
ATC005 | US005 – Contacts | Verify that users can access the “Contacts” page. | User is on the homepage. | 1. Click “Contact Us.” | Contact information and form are displayed.
ATC006 | US006 – View User Profiles | Verify that users can view other user profiles. | At least one profile exists. | 1. Search or click a user profile. | Public profile information is shown.
ATC007 | US007 – Read Traveler Testimonials | Verify that users can view traveler testimonials. | Testimonials exist. | 1. Navigate to the “Testimonials” section. | Testimonials are displayed correctly.


### 3.2 Guest

Test ID | User Story Ref. | Description | Preconditions | Test Steps | Expected Result
-- | -- | -- | -- | -- | --
ATC101 | US101 – Login | Verify login functionality. | Guest account exists. | 1. Open login page. <br>2. Enter valid credentials. <br>3. Click “Login.” | System authenticates user and redirects to dashboard.
ATC102 | US102 – Registration | Verify registration process. | None. | 1. Open registration page. <br>2. Fill required fields. <br>3. Submit form. | Account created and user logged in or redirected to login page.
ATC103 | US103 – Recover Password | Verify password recovery. | User has valid email. | 1. Open “Forgot Password.” <br>2. Enter email. <br>3. Submit. | Password reset email sent.


### 3.3. Authenticated User

Test ID | User Story Ref. | Description | Preconditions | Test Steps | Expected Result
-- | -- | -- | -- | -- | --
ATC201 | US201 – Logout | Verify logout process. | User logged in. | 1. Click “Logout.” | User session ends and redirected to homepage.
ATC202 | US202 – View Profile | Verify viewing own profile. | User logged in. | 1. Click “Profile.” | Profile page displays user information.
ATC203 | US203 – Edit Profile | Verify updating personal info. | User logged in. | 1. Go to “Profile.” <br>2. Click “Edit.” <br>3. Update info. <br>4. Save. | Changes are saved and displayed.
ATC204 | US204 – Create Traveler Profile | Verify creation of Traveler profile. | User logged in without Traveler role. | 1. Open Traveler setup page. <br>2. Fill preferences. <br>3. Submit. | Traveler profile created and linked to user account.
ATC205 | US205 – Edit Settings | Verify account settings modification. | User logged in. | 1. Go to Settings.<br>2. Change language/currency. <br>3. Save. | Settings updated successfully.
ATC206 | US206 – Delete Account | Verify account deletion. | User logged in. | 1. Navigate to Account Settings. <br>2. Select “Delete Account.” | Account deleted and user redirected to homepage.
ATC207 | US207 – Support Profile Picture | Verify profile picture upload. | User logged in. | 1. Go to profile.<br>2. Click “Change Picture.” <br>3. Upload image. | New profile picture displayed.
ATC208 | US208 – View Personal Notifications | Verify notification list. | User has notifications. | 1. Click notifications icon. | List of notifications displayed.
ATC209 | US209 – Save Other Users’ Trips | Verify trip saving. | User logged in. | 1. Open public trip. <br>2. Click “Save.” | Trip added to saved trips list.
ATC210 | US210 – Multi-Channel Notifications | Verify notifications across channels. | User logged in and has email set. | 1. Trigger trip update event. | Notification appears in app and email inbox.
ATC211 | US211 – Configure Notification Preferences | Verify customizing notifications. | User logged in. | 1. Go to notification settings. <br>2. Modify preferences. | Settings saved successfully.


### 3.4. Traveler

Test ID | User Story Ref. | Description | Preconditions | Test Steps | Expected Result
-- | -- | -- | -- | -- | --
ATC301 | US301 – Create New Trip | Verify trip creation. | Traveler logged in. | 1. Click “Create Trip.” <br>2. Enter details. 3. Save. | New trip created and shown in dashboard.
ATC302 | US302 – Select Trip Locations | Verify adding destinations. | Traveler creating trip. | 1. Add multiple destinations. 2. Save. | Locations appear in trip summary.
ATC303 | US303 – Add Trip Expenses | Verify adding expense. | Traveler has trip. | 1. Open trip. <br>2. Add expense details. | Expense appears in list.
ATC304 | US304 – View Expense Summary | Verify viewing expense summary. | Expenses exist. | 1. Open “Expenses” tab. | Summary by category/currency displayed.
ATC305 | US305 – Add Flight Segment | Verify adding flight segment. | Traveler has trip. | 1. Add flight info. | Flight segment added.
ATC306 | US306 – Share Trip Publicly | Verify public sharing. | Trip exists. | 1. Click “Share Trip.” <br>2. Select visibility options. | Trip becomes accessible via public link.
ATC307 | US307 – Upcoming Trips | Verify listing of upcoming trips. | Traveler has trips. | 1. View profile dashboard. | Upcoming trips listed chronologically.
ATC308 | US308 – Quick Access to Trip | Verify dashboard navigation. | Traveler has trips. | 1. Click trip thumbnail. | Redirected to trip dashboard.
ATC309 | US309 – AI Trip Plan Suggestion | Verify AI-generated itinerary. | Traveler provides preferences. | 1. Enter destinations/dates. <br>2. Click “Generate Plan.” | AI returns suggested itinerary.
ATC310 | US310 – Add Must-Visit Locations | Verify adding personal preferences. | Traveler in trip planner. | 1. Add must-visit spots. | AI updates itinerary accordingly.
ATC311 | US311 – Accept and Edit AI Plan | Verify editing AI plan. | AI plan exists. | 1. Accept plan. <br>2. Edit activities. | Modified plan saved.
ATC312 | US312 – Dynamic Trip Plan Updates | Verify dynamic plan suggestions. | Active trip with flight/weather data. | 1. Trigger flight delay/weather change. | AI suggests updated itinerary.
ATC313 | US313 – Plan Change Notifications | Verify AI change notifications. | Plan updated. | 1. Receive update alert. | Notification displayed.
ATC314 | US314 – View Trip Plan on Map | Verify itinerary visualization. | Itinerary exists. | 1. Click “Map View.” | Route displayed on map.
ATC315 | US315 – Receive Flight Updates | Verify flight status updates. | Flight segment added. | 1. Monitor trip. | Flight delay/change notifications received.
ATC316 | US316 – Weather Change Updates | Verify weather notifications. | Destination set. | 1. Simulate weather change. | Notification displayed.
ATC317 | US317 – Smart Packing List | Verify automatic packing list. | Trip created. | 1. Open packing tab. | Suggested items generated.
ATC318 | US318 – Profile-Based Packing Recommendations | Verify personalized suggestions. | Traveler has profile history. | 1. Generate packing list. | Personalized items suggested.
ATC319 | US319 – Modify Packing List Items | Verify manual adjustments. | Packing list exists. | 1. Add/remove items. | Changes saved successfully.
ATC320 | US320 – Weather Change Packing Alerts | Verify weather-triggered packing alerts. | Weather changes. | 1. Trigger weather update. | Packing list suggestions updated.
ATC321 | US321 – Add Trip Cover Image | Verify cover image upload. | Trip exists. | 1. Click “Add Cover.” <br>2. Upload image. | Image displayed on trip card.
ATC322 | US322 – Edit Expenses | Verify expense editing. | Expense exists. | 1. Select expense. <br>2. Edit details. | Updated info saved.
ATC323 | US323 – Remove Expenses | Verify expense deletion. | Expense exists. | 1. Click delete. | Expense removed.
ATC324 | US324 – View Past Trips | Verify viewing past trips. | Traveler has history. | 1. Open “Past Trips.” | List of past trips displayed.
ATC325 | US325 – Invite Collaborators | Verify inviting users. | Trip exists. | 1. Click “Invite Collaborator.” <br>2. Send invite. | Collaborator receives invitation.
ATC326 | US326 – Track Plan Version History | Verify plan version tracking. | Trip has AI edits. | 1. Open version history. | Previous plan versions listed.
ATC327 | US327 – Search and Filter Trips | Verify filtering functionality. | Multiple trips exist. | 1. Apply filters by date/destination. | Filtered results displayed.
ATC328 | US328 – Switch Trip Currency | Verify currency conversion. | Trip exists. | 1. Select alternate currency. | Converted totals displayed.
ATC329 | US329 – Visited Countries Map | Verify map visualization. | Traveler has trips. | 1. View “Visited Countries.” | Map with visited countries highlighted.

### 3.4. Collaborator

Test ID | User Story Ref. | Description | Preconditions | Test Steps | Expected Result
-- | -- | -- | -- | -- | --
ATC401 | US401 – View Shared Trip Details | Verify viewing shared trip. | Collaborator invited. | 1. Open shared trip link. | Trip details displayed.
ATC402 | US402 – Add or Update Shared Expenses | Verify managing shared expenses. | Collaborator has permissions. | 1. Add or edit expense. | Expense updated for all collaborators.
ATC403 | US403 – Receive Trip Update Notifications | Verify update notifications. | Trip updates occur. | 1. Collaborator receives alert. | Notification received in real time.
ATC404 | US404 – View Permissions | Verify permissions visibility. | Collaborator invited. | 1. Open trip settings. | Permissions list displayed.
ATC405 | US405 – Add Comments or Notes | Verify adding comments. | Shared trip open. | 1. Add note to itinerary. | Note visible to collaborators.


### 3.5. Administrator

Test ID | User Story Ref. | Description | Preconditions | Test Steps | Expected Result
-- | -- | -- | -- | -- | --
ATC501 | US501 – Manage User Accounts | Verify account management. | Administrator logged in. | 1. Access admin dashboard. <br>2. Deactivate or delete a user. | User status updated in system.

## 4. Wireframes

This section presents the main app screens and navigation flow of the TripTally app.

### Wireframe 1 - Mainpage
**Related User Stories:** US001, US002

<img width="890" height="323" alt="Mainpage" src="https://github.com/user-attachments/assets/4e009574-0aa0-4676-ae7e-254f02b25938" />

### Wireframe 2 - Login Page
**Related User Stories:** US101, US103

<img width="890" height="491" alt="LoginPage" src="https://github.com/user-attachments/assets/c4deb067-2c2c-4d44-a99f-6a5fa1dd4f48" />

### Wireframe 3 - Profile
**Related User Stories:** US202, US307, US308

<img width="890" height="472" alt="Profile" src="https://github.com/user-attachments/assets/7fc9a271-44cb-4531-b521-a9ec9b35389a" />

### Wireframe 4 - Create Trip
**Related User Stories:** US301, US302, US303, US304, US305, US306

<img width="890" height="383" alt="TripOverviewAndExpenses" src="https://github.com/user-attachments/assets/58dd3387-1c1e-447d-8d07-edb8e6ff16b4" />

<img width="890" height="224" alt="Flights" src="https://github.com/user-attachments/assets/28d9b957-1450-4966-960b-98d18125cfa0" />

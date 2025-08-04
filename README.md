# GOLD Boolean

A sophisticated web-based application for managing recruitment keywords, boolean searches, and role management with advanced filtering capabilities.

## Features

### Core Functionality
- **Storage Section**: Manage keywords organized by categories
  - Primary Categories: Titles, Domain, Industry
  - Secondary Categories: Context, Certifications & Clearances
  - Subcategory management for each category
  - Boolean search creation and management

- **Builder Section**: Build complex search strings by combining keywords from different categories
  - Three-column layout for role cards
  - Advanced search functionality with positioning controls
  - **Saved Searches**: Save and manage favorite search strings with star icons
  - **Dynamic "Add All to Search"**: Automatically uses active Auto AND/OR mode

- **Trainer Section**: Store and manage training content

### Boolean Search Features
- **Error Deduplication**: Groups identical syntax errors with counts (e.g., "Unmatched closing parenthesis (x3)")
- **Error Threshold Modals**: Sarcastic feedback pop-ups at 5, 10, 15, 20+ errors
- **Enhanced Validation**: Improved handling of parentheses, quoted terms, and complex expressions
- **Keyboard Shortcuts**: 
  - Up Arrow (↑): Activate Auto AND mode
  - Down Arrow (↓): Activate Auto OR mode
  - Works even when Boolean input field is focused

### Role Management Dashboard
- **Advanced Filtering System**: Filter roles by Client, ID, and Title
  - Modal-based filter interface
  - Client dropdown with duplicate prevention
  - Clear and Apply filter options
  - Real-time filtering results

- **Role Search**: Positioned search functionality with customizable placement
- **Role Cards**: Multi-column layout (3 cards per row) for better organization

### User Interface
- **Modern Design**: Sharp, smart, and simple interface
  - Neutral color palette
  - Professional typography
  - Responsive layout
  - Sophisticated gold gradient effects
  - **Custom Favicon**: Gold bullion icon in browser tabs

### Data Management
- **Local Storage**: All data stored locally in browser's localStorage
- **Export/Import**: Save and backup functionality
- **Real-time Updates**: Instant reflection of changes across all sections

## Categories

### Titles
- Technical
- Functional

### Domain
- Agile & Scrum
- AI & Machine Learning
- Architecture
- Change & Transformation
- Cyber Security
- Data & Analytics
- DevOps & Platform Engineering
- Digital
- Financial Crime
- Infrastructure & Cloud
- Payments & Banking Tech
- Product & Design
- Project Services
- Risk & Compliance
- Software Engineering
- Testing & QA

### Industry
- Insurance
- Bank
- Superannuation
- Financial

## Usage

1. Open `index.html` in a web browser
2. Navigate through categories to manage keywords
3. Create boolean searches with multiple options
4. Use the Builder section to combine keywords
5. Store training content in the Trainer section
6. Use the role management dashboard with advanced filtering
7. **Use keyboard shortcuts for quick Auto AND/OR switching**
8. **Save favorite searches with star icons**
9. **Monitor error thresholds with helpful modal feedback**

## Setup

Simply open `index.html` in any modern web browser. No additional dependencies required.

## Recent Updates (v1.9)

- **Branding Update**: Changed from "BULLION GOLD" to "GOLD Boolean"
- **Error Deduplication**: Groups identical syntax errors with counts
- **Error Threshold Modals**: Sarcastic feedback at 5, 10, 15, 20+ errors
- **Keyboard Shortcuts**: Up/Down arrows for Auto AND/OR modes
- **Enhanced Boolean Validation**: Improved parentheses and quoted term handling
- **Saved Searches**: Star icons and saved searches component with filter
- **Dynamic "Add All to Search"**: Uses active Auto AND/OR mode
- **Custom Favicon**: Gold bullion icon implementation
- **Dark Mode Removal**: Completely removed for cleaner interface
- **Role Management**: Advanced filtering system with modal interface
- **Layout Improvements**: Three-column role card layout
- **Search Positioning**: Configurable search input placement
- **UI Enhancements**: Professional styling with gold gradients and improved typography

## Data Storage

All data is stored locally in the browser's localStorage with automatic backup functionality. 
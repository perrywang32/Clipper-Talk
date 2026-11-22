# Clipper Talk

Clipper Talk is a small, Reddit-style forum for Clippers basketball fans. It is built with React and Vite and includes example posts so the main feed has content when the app first opens.

## Run locally

1. Install Node.js if it is not already installed.
2. In this folder, run `npm install`.
3. Run `npm run dev` and open the local URL Vite prints in the terminal.

Posts, comments, profile name, and demo notifications are stored in this browser. Uploaded images and videos are stored in IndexedDB on this device. This is a front-end prototype: it does not yet have shared accounts, cross-device sync, or remote media storage.

## Current features

- Create posts with a required title, optional text, a direct image URL, or an uploaded photo/video (up to 50 MB)
- Preview image URLs while composing; non-image URLs show an error
- Browse a feed that shows post time, title, and upvote count
- Search posts by title and sort by newest or most popular
- Open a post, add comments and replies, edit your own comments/replies, and upvote or downvote
- Edit posts from the feed, post page, or local profile; delete posts from the post page or profile
- Open a local account/profile page and edit its display name
- Open the notification bell, mark notifications read, or add a sample notification to preview it

# Web Development Final Project - *Clipper Talk Forum*

Submitted by: **Perry Wang**

This web app: **Clipper Talk**

Time spent: **6** hours spent in total

## Required Features

The following **required** functionality is completed:


- [ ] **Web app includes a create form that allows the user to create posts**
  - Form requires users to add a post title
  - Forms should have the *option* for users to add: 
    - additional textual content
    - an image added as an external image URL
- [ ] **Web app includes a home feed displaying previously created posts**
  - Web app must include home feed displaying previously created posts
  - By default, each post on the posts feed should show only the post's:
    - creation time
    - title 
    - upvotes count
  - Clicking on a post should direct the user to a new page for the selected post
- [ ] **Users can view posts in different ways**
  - Users can sort posts by either:
    -  creation time
    -  upvotes count
  - Users can search for posts by title
- [ ] **Users can interact with each post in different ways**
  - The app includes a separate post page for each created post when clicked, where any additional information is shown, including:
    - content
    - image
    - comments
  - Users can leave comments underneath a post on the post page
  - Each post includes an upvote button on the post page. 
    - Each click increases the post's upvotes count by one
    - Users can upvote any post any number of times

- [ ] **A post that a user previously created can be edited or deleted from its post pages**
  - After a user creates a new post, they can go back and edit the post
  - A previously created post can be deleted from its post page

The following **optional** features are implemented:


- [ ] Web app implements pseudo-authentication
  - Users can only edit and delete posts or delete comments by entering the secret key, which is set by the user during post creation
  - **or** upon launching the web app, the user is assigned a random user ID. It will be associated with all posts and comments that they make and displayed on them
  - For both options, only the original user author of a post can update or delete it
- [ ] Users can repost a previous post by referencing its post ID. On the post page of the new post
  - Users can repost a previous post by referencing its post ID
  - On the post page of the new post, the referenced post is displayed and linked, creating a thread
- [ ] Users can customize the interface
  - e.g., selecting the color scheme or showing the content and image of each post on the home feed
- [ ] Users can add more characterics to their posts
  - Users can share and view web videos
  - Users can set flags such as "Question" or "Opinion" while creating a post
  - Users can filter posts by flags on the home feed
  - Users can upload images directly from their local machine as an image file
- [ ] Web app displays a loading animation whenever data is being fetched

The following **additional** features are implemented:

* [ ] List anything else that you added to improve the site's functionality!

## Video Walkthrough

Here's a walkthrough of implemented user stories:

<div>
    <a href="https://www.loom.com/share/b57311ced64540629f7afa1316df1b9a">
    </a>
    <a href="https://www.loom.com/share/b57311ced64540629f7afa1316df1b9a">
      <img style="max-width:300px;" src="https://www.loom.com/v1/videos/b57311ced64540629f7afa1316df1b9a/thumbnail.gif">
    </a>
  </div>
## Notes

Describe any challenges encountered while building the app.

## License

    Copyright [yyyy] [name of copyright owner]

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

        http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.

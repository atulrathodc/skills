---
name: rails-app
description: Develop, run, and debug Ruby on Rails web apps and APIs — bundler, ActiveRecord models, migrations, controllers, routes, and Puma server.
allowed-tools: Bash, Read, Grep, Glob, Edit, Write
---

# Ruby on Rails App

Rails specifics (Ruby, convention-over-configuration, ActiveRecord).

0. **Greenfield Scaffolding** — For a new Rails project:
   `rails new . --api --database=sqlite3 --skip-git` (for API-only)
   Or standard full-stack:
   `rails new . --database=sqlite3 --skip-git`
   Run `bundle install` afterwards.

1. **Routing** — Routes live in `config/routes.rb`:
   - `resources :articles` generates standard RESTful routes.
   - Root route: `root "home#index"`.
   - Inspect all routes with `bin/rails routes`.

2. **Controllers & Parameters**:
   - Controllers live in `app/controllers/<name>_controller.rb` inheriting from `ApplicationController`.
   - Strong parameters: ALWAYS require and permit parameters:
     ```ruby
     def article_params
       params.require(:article).permit(:title, :body)
     end
     ```
   - Render JSON: `render json: @article, status: :created`.

3. **ActiveRecord & Migrations**:
   - Generate models: `bin/rails generate model Article title:string body:text`.
   - Run migrations: `bin/rails db:migrate`.
   - Verify database status: `bin/rails db:migrate:status`.
   - Never edit existing committed migrations; generate a new migration with `bin/rails g migration <Description>`.

4. **Puma Server & Environment**:
   - Start server: `bin/rails server -p 3000` (or `bundle exec rails s`).
   - Configuration in `config/environments/development.rb` and `config/database.yml`.
   - Console for debugging: `bin/rails console`.

5. **Verify** — Start Puma server in background, curl endpoint (`curl -i http://localhost:3000/...`), run test suite with `bin/rails test`.

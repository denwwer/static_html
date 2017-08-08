When SPA used then request via `curl` not return full page content what user see, we know that. Many web crawler when indexing cannot execute JS on page or do it not so good. For this I created simple JS script running on `phantomjs` to resolve this and render crawler page exactly how it looks after JS executed. This requires some little work described in steps.

For this example I used Ubuntu and Rails with `gem 'browser'`. This is used on real/live project.
#### 1. First install `phantomjs`

#### 2. Then use some your callback to execute script on server

I used [capistrano](http://capistranorb.com/) callback `after :finished`, my stript location is project root `lib` directory

```
# config/deploy.rb

# inside `namespace :deploy`
namespace :deploy do
  desc 'Generate static pages for bot'
  task :static_pages do
    on roles(:app) do
      within release_path do
        execute :phantomjs, release_path.join('lib/generate_pages.js')
      end
    end
  end
  
  after :finished, :static_pages
end

```

Pages will generated in `/public/static_pages` (example path in `generate_pages.js`)

#### 3. Now need detect web crawler and render static page

I use my `HomeController` for SPA entry point to process some required operation, so I add

```
# app/controllers/home_controller.rb

before_action :render_static_page

def render_static_page
  return unless browser.bot?

  page = params[:path].blank? ? 'index' : params[:path].gsub('/', '_')
  page << '.html'
  page = Rails.root.join('public', 'static_pages', page)

  if File.exists?(page)
   render file: page, layout: nil and return
  else
   render text: nil, status: 404
  end
end
```

Now when bot request the page it will be search on `static_pages` and render it otherwise return 404.

#### 4. Tets it
To validate is works `curl` with some "bot" User Agent can be used. It should return generated page if all done right.

```
curl -A 'googlebot' localhost:3000
```


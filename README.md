# novel-scraper

## Getting Started
1. `git clone https://github.com/KiriXen/novel-api.git`
2. `npm i or npm install`
3. `npm run start`
   
## Base URL
`http://localhost:8080` 

Novel endpoints are prefixed with `/api/novel`. <br>
Genre endpoints are prefixed with `/api/genre`.


## Endpoints


<details>
  <summary><strong> Latest :</strong></summary> <hr>

**Endpoint:**
```
GET /api/novel/latest
```

**Description:**
Fetches a list of novel latest chapters.
<hr>
</details>

<details>
  <summary><strong> Hot :</strong></summary> <hr>

**Endpoint:**
```
GET /api/novel/hot
```

**Description:**
Fetches a list of hot novels.
<hr>
</details>


<details>
  <summary><strong> Completed :</strong></summary> <hr>

**Endpoint:**
```
GET /api/novel/completed
```

**Description:**
Fetches a list of completed novels.
<hr>
</details>


<details>
  <summary><strong>Details :</strong></summary> <hr>

**Endpoint:**
```
GET api/novel/description/:id
```

**Description:**
Fetches the anime description

**Query Parameters:**
- `id` (required) - the novel hash id
```
GET http://localhost:8080/api/novel/description/ba4b33b452fd42e84305c9e32540906100f295a55040c82a3299dd341d5a8267
``` 
<hr>
</details>

<details>
  <summary><strong>Content for the chapter : </strong></summary> <hr>

**Endpoint:**
```
GET api/novel/content/:chapterid
```

**Description:**
Fetches the chapter's content

**Query Parameters:**
- `chapterid` (required) - the chapter has id

```
GET http://localhost:8080/api/novel/content/ba4b33b452fd42e84305c9e32540906100f295a55040c82a3299dd341d5a8267
``` 
<hr>
</details>


<details>
  <summary><strong>Search :</strong></summary> <hr>
  
**Endpoint:**
```
GET /api/novel/search/:query/:page
```

**Description:**
Fetches a list of anime based on the query

**Query Parameters:**
- `query` (required) - what kind of novel do u want to read.
- `page` (required) - Specifies the page number for pagination.
  - Default: `1`

```
GET http://localhost:8080/api/novel/search/novel/1
```

<hr>
</details>


Click here to understand the routes [more](https://github.com/KiriXen/novel-api/blob/main/api/routes/novel-routes.js) 


If you have suggestions or feature requests, feel free to open an issue!

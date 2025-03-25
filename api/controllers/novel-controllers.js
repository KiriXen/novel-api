import axios from "axios";
import * as cheerio from "cheerio";
import NodeCache from "node-cache";

const url = "https://novelfull.net";

const agents = [
  "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Mobile Safari/537.36,gzip(gfe)",
  "Mozilla/5.0 (iPhone14,3; U; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/602.1.50 (KHTML, like Gecko) Version/10.0 Mobile/19A346 Safari/602.1",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.135 Safari/537.36 Edge/12.246",
  "Mozilla/5.0 (X11; Linux x86_64; rv:107.0) Gecko/20100101 Firefox/107.0",
];

const cache = new NodeCache({ stdTTL: 3600, checkperiod: 120 });

const encodeId = (url) => {
  return Buffer.from(url).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
};

const decodeId = (encodedId) => {
  const paddedId = encodedId.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice(0, (4 - encodedId.length % 4) % 4);
  return Buffer.from(paddedId, 'base64').toString('utf8');
};

const fetchWithCache = async (cacheKey, fetchFn) => {
  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    return cachedData;
  }

  const data = await fetchFn();
  cache.set(cacheKey, data);
  return data;
};

// GET THE HOTTEST NOVELS
export const HOT_NOVELS = async (req, res, next) => {
  const cacheKey = "hot_novels";
  try {
    const data = await fetchWithCache(cacheKey, async () => {
      const response = await axios.get(url, {
        headers: {
          "User-Agent": agents[Math.floor(Math.random() * agents.length)],
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
          "Accept-Encoding": "gzip, deflate, br",
          "Accept-Language": "en-US,en;q=0.9,en;q=0.8",
        },
      });
      const html = response.data;
      const $ = cheerio.load(html);
      const hot = [];

      $(".item", html).each(function () {
        const title = $(this).find("img").attr("alt");
        const link = url + $(this).find("a").attr("href");
        const img = url + $(this).find("img").attr("src");

        hot.push({
          title,
          id: encodeId(link),
          img,
        });
      });

      return hot;
    });

    res.status(200).json(data);
  } catch (err) {
    res.status(403).json({ error: err.message });
  }
};

// GET LATEST NOVELS
export const LATEST_NOVELS = async (req, res, next) => {
  const cacheKey = "latest_novels";
  try {
    const data = await fetchWithCache(cacheKey, async () => {
      const response = await axios.get(url, {
        headers: {
          "User-Agent": agents[Math.floor(Math.random() * agents.length)],
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
          "Accept-Encoding": "gzip, deflate, br",
          "Accept-Language": "en-US,en;q=0.9,en;q=0.8",
        },
      });
      const html = response.data;
      const $ = cheerio.load(html);
      const latest = [];

      $(".list.index-intro > .row", html).each(function () {
        const title = $(this).find("h3").text();
        const link = url + $(this).find("a").attr("href");
        const genres = $(this).find(".col-cat").text();
        const latest_chapter = $(this).find(".text-info").text();
        const latest_chapter_link = url + $(this).find(".text-info").find("a").attr("href");
        const update_time = $(this).find(".col-time").text();
        const label_hot = $(this).find(".col-title > .label-hot").get(0) ? true : false;
        const label_full = $(this).find(".col-title > .label-full").get(0) ? true : false;
        const label_new = $(this).find(".col-title > .label-new").get(0) ? true : false;

        latest.push({
          title,
          id: encodeId(link),
          genres,
          latest_chapter,
          latest_chapter_id: encodeId(latest_chapter_link),
          update_time,
          label_hot,
          label_full,
          label_new,
        });
      });

      return latest;
    });

    res.status(200).json(data);
  } catch (err) {
    res.status(403).json({ error: err.message });
  }
};

// GET COMPLETED NOVELS
export const COMPLETED_NOVELS = async (req, res, next) => {
  const cacheKey = "completed_novels";
  try {
    const data = await fetchWithCache(cacheKey, async () => {
      const response = await axios.get(url, {
        headers: {
          "User-Agent": agents[Math.floor(Math.random() * agents.length)],
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
          "Accept-Encoding": "gzip, deflate, br",
          "Accept-Language": "en-US,en;q=0.9,en;q=0.8",
        },
      });
      const html = response.data;
      const $ = cheerio.load(html);
      const completed = [];

      $(".list.list-thumbnail > .row a", html).each(function () {
        const title = $(this).attr("title");
        const link = url + $(this).attr("href");
        const img = url + $(this).find("img").attr("src");
        const count = $(this).find("small").text();

        completed.push({
          title,
          id: encodeId(link),
          img,
          count,
        });
      });

      return completed;
    });

    res.status(200).json(data);
  } catch (err) {
    res.status(403).json({ error: err.message });
  }
};

// GET NOVELS BY KEYWORDS
export const GET_NOVEL_BY_KEYWORDS = async (req, res, next) => {
  const key = req.params.key;
  const page = req.params.page;
  const cacheKey = `search_${key}_${page}`;
  const newKey = key.replaceAll(" ", "+");
  let newUrl = `${url}/search?keyword=${newKey}&page=${page}`;
  if (page === "1") newUrl = `${url}/search?keyword=${newKey}`;

  try {
    const data = await fetchWithCache(cacheKey, async () => {
      const response = await axios.get(newUrl, {
        headers: {
          "User-Agent": agents[Math.floor(Math.random() * agents.length)],
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
          "Accept-Encoding": "gzip, deflate, br",
          "Accept-Language": "en-US,en;q=0.9,en;q=0.8",
        },
      });
      const html = response.data;
      const $ = cheerio.load(html);
      const search_req = [];
      let pagination = $(".pagination-container")
        ?.find(".last > a")
        .attr("href")
        ?.split("page=")[1] || $("#list-chapter")
        ?.find("ul.pagination-sm > li:nth-of-type(9) > a")
        .text();

      search_req.push({ pagination: parseInt(pagination) || 1 });

      $(".list.list-truyen > .row", html).each(function () {
        const title = $(this).find(".truyen-title").text();
        const link = url + $(this).find("a").attr("href");
        const author = $(this).find("span.author").text();
        const img = url + $(this).find("img").attr("src");
        const latest_chapter = url + $(this).find(".text-info").find("a").attr("href");
        const latest_chapter_title = $(this).find(".text-info").find("a").attr("title");
        const label_hot = $(this).find(".label-hot").get(0) ? true : false;
        const label_full = $(this).find(".label-full").get(0) ? true : false;
        const label_new = $(this).find(".label-new").get(0) ? true : false;

        if (title && link && author && img && latest_chapter) {
          search_req.push({
            title,
            id: encodeId(link),
            author,
            img,
            latest_chapter_id: encodeId(latest_chapter),
            latest_chapter_title,
            label_hot,
            label_full,
            label_new,
          });
        }
      });

      return search_req;
    });

    res.status(200).json(data);
  } catch (err) {
    res.status(403).json({ error: err.message });
  }
};

// GET NOVEL DESCRIPTION
export const GET_NOVEL_DESC = async (req, res, next) => {
  const novelId = req.params.id;
  if (!novelId) return res.status(400).json({ error: "Novel ID is required" });

  const link = decodeId(novelId);
  const page = req.query.page || 1;
  const cacheKey = `novel_desc_${novelId}_${page}`;
  const requestUrl = page > 1 ? `${link}?page=${page}` : link;

  try {
    const data = await fetchWithCache(cacheKey, async () => {
      const response = await axios.get(requestUrl, {
        headers: {
          "User-Agent": agents[Math.floor(Math.random() * agents.length)],
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
          "Accept-Encoding": "gzip, deflate, br",
          "Accept-Language": "en-US,en;q=0.9",
        },
      });
      const html = response.data;
      const $ = cheerio.load(html);
      const novel_description = [];

      $(".col-truyen-main", html).each(function () {
        const img = url + $(this).find("img").attr("src");
        const title = $(this).find("img").attr("alt");
        const description = $(this).find("div.desc-text").text().replaceAll("\n", "");
        const latest_chapter = $(this).find("ul.l-chapters > li:first-of-type > a").text().replaceAll("\n", "");
        const latest_chapter_link = url + $(this).find("ul.l-chapters > li:first-of-type > a").attr("href");
        const update_time = "";
        const first_chapter_title = $(this).find("ul.list-chapter > li:first-of-type > a").first().text().replaceAll("\n", "");
        const first_chapter_link = url + $(this).find("ul.list-chapter > li:first-of-type > a").first().attr("href");

        let rating = $(this).find(".desc > .small").text().split(/[/\s]+/).filter(el => !isNaN(parseFloat(el))).map(el => parseFloat(el));

        const chapters = [];
        $("#list-chapter .list-chapter > li > a", html).each(function () {
          const chapter_title = $(this).text().replaceAll("\n", "").trim();
          const chapter_link = url + $(this).attr("href");
          chapters.push({
            chapter_title,
            chapter_id: encodeId(chapter_link),
          });
        });

        let totalPages = $("#list-chapter")?.find(".last > a").attr("href")?.split("page=")[1] || $("#list-chapter")?.find("ul.pagination-sm > li:nth-of-type(9) > a").text();

        novel_description.push({
          id: encodeId(link),
          img,
          title,
          rating,
          attr: [],
          description,
          first_chapter_title,
          first_chapter_id: encodeId(first_chapter_link),
          latest_chapter,
          latest_chapter_id: encodeId(latest_chapter_link),
          update_time,
          chapters,
          pagination: {
            current_page: parseInt(page),
            total_pages: parseInt(totalPages) || 1,
          },
        });

        $(this).find(".info-holder > .info > div").each(function () {
          const label = $(this).text().split(":")[0].trim();
          const value = $(this).text().split(":")[1].trim();
          novel_description[0].attr.push({
            label,
            value: value.replace("See more »", "").replaceAll("\n", ""),
          });
        });
      });

      return novel_description;
    });

    res.status(200).json(data);
  } catch (err) {
    res.status(403).json({ error: err.message });
  }
};

// GET PREV AND NEXT CHAPTERS
export const GET_PREV_NEXT_CHAPTER = async (req, res, next) => {
  const chapterId = req.params.chapter_hash_id;
  if (!chapterId) return res.status(400).json({ error: "Chapter ID is required" });

  const link = decodeId(chapterId);
  const cacheKey = `navigate_${chapterId}`;

  try {
    const data = await fetchWithCache(cacheKey, async () => {
      const response = await axios.get(link, {
        headers: {
          "User-Agent": agents[Math.floor(Math.random() * agents.length)],
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
          "Accept-Encoding": "gzip, deflate, br",
          "Accept-Language": "en-US,en;q=0.9,en;q=0.8",
        },
      });
      const html = response.data;
      const $ = cheerio.load(html);
      const navigation_links = [];

      let prev_isDisabled = $("#prev_chap", html).attr("disabled") !== undefined;
      let prev_link = url + $("#prev_chap", html).attr("href");
      let prev_title = $("#prev_chap", html).attr("title");

      let next_isDisabled = $("#next_chap", html).attr("disabled") !== undefined;
      let next_link = url + $("#next_chap", html).attr("href");
      let next_title = $("#next_chap", html).attr("title");

      navigation_links.push({
        prev_isDisabled,
        prev_id: prev_link.startsWith(url) ? encodeId(prev_link) : null,
        prev_title,
      });

      navigation_links.push({
        next_isDisabled,
        next_id: next_link.startsWith(url) ? encodeId(next_link) : null,
        next_title,
      });

      return navigation_links;
    });

    res.status(200).json(data);
  } catch (err) {
    res.status(403).json({ error: err.message });
  }
};

// GET CHAPTER CONTENTS
export const GET_CHAPTER_CONTENTS = async (req, res, next) => {
  const chapterId = req.params.chapter_hash_id;
  if (!chapterId) return res.status(400).json({ error: "Chapter ID is required" });

  const link = decodeId(chapterId);
  const cacheKey = `chapter_content_${chapterId}`;

  try {
    const data = await fetchWithCache(cacheKey, async () => {
      const response = await axios.get(link, {
        headers: {
          "User-Agent": agents[Math.floor(Math.random() * agents.length)],
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
          "Accept-Encoding": "gzip, deflate, br",
          "Accept-Language": "en-US,en;q=0.9,en;q=0.8",
        },
      });
      const html = response.data;
      const $ = cheerio.load(html);
      
      let paragraphContent = '';
      const chapterContents = {
        content: '',
        navigation: {
          prev: {},
          next: {}
        },
        metadata: {
          novelTitle: '',
          novelId: '',
          chapterTitle: ''
        }
      };

      $("#chapter-content > *", html).each(function () {
        const name = $(this).get(0).name;
        const className = $(this).get(0).attribs?.class || '';
        
        if (name === "p" && !className.includes("ads")) {
          const pContent = $(this).prop("innerHTML").trim();
          if (pContent && pContent !== '') {
            paragraphContent += (paragraphContent ? '<br><br>' : '') + pContent;
          }
        }
      });

      const prevChap = $("#prev_chap", html);
      chapterContents.navigation.prev = {
        isDisabled: prevChap.attr("disabled") !== undefined,
        id: prevChap.attr("href") ? encodeId(url + prevChap.attr("href")) : null,
        title: prevChap.attr("title") || ''
      };

      const nextChap = $("#next_chap", html);
      chapterContents.navigation.next = {
        isDisabled: nextChap.attr("disabled") !== undefined,
        id: nextChap.attr("href") ? encodeId(url + nextChap.attr("href")) : null,
        title: nextChap.attr("title") || ''
      };

      chapterContents.metadata.novelTitle = $(".truyen-title", html).text().trim();
      const novelLink = $(".truyen-title", html).attr("href");
      chapterContents.metadata.novelId = novelLink ? encodeId(url + novelLink) : '';
      chapterContents.metadata.chapterTitle = $(".chapter-title .chapter-text", html).text().trim();

      chapterContents.content = paragraphContent;

      return chapterContents;
    });

    res.status(200).json(data);
  } catch (err) {
    res.status(403).json({ error: err.message });
  }
};


export const GET_ALL_HOT_NOVELS = async (req, res, next) => {
  const { page } = req.params;
  const cacheKey = `all_hot_novels_${page}`;
  const hot_url = `${url}/hot-novel?page=${page}`;

  try {
    const data = await fetchWithCache(cacheKey, async () => {
      const response = await axios.get(hot_url, {
        headers: {
          "User-Agent": agents[Math.floor(Math.random() * agents.length)],
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
          "Accept-Encoding": "gzip, deflate, br",
          "Accept-Language": "en-US,en;q=0.9,en;q=0.8",
        },
      });
      const html = response.data;
      const $ = cheerio.load(html);
      const hot_novels = [];
      let pagination = $(".pagination-container")
        ?.find(".last > a")
        .attr("href")
        ?.split("page=")[1] || $(".pagination-container")
        ?.find("ul.pagination-sm > li:nth-of-type(9)")
        .text();

      hot_novels.push({ pagination: parseInt(pagination) || 1 });

      $(".list.list-truyen > .row", html).each(function () {
        const title = $(this).find(".truyen-title").text();
        const link = url + $(this).find(".truyen-title > a").attr("href");
        const author = $(this).find("span.author").text();
        const img = url + $(this).find("img").attr("src");
        const latest_chapter = url + $(this).find(".text-info").find("a").attr("href");
        const latest_chapter_title = $(this).find(".text-info").find("a").attr("title");
        const label_hot = $(this).find(".label-hot").get(0) ? true : false;
        const label_full = $(this).find(".label-full").get(0) ? true : false;
        const label_new = $(this).find(".label-new").get(0) ? true : false;

        if (title && link && author && img && latest_chapter) {
          hot_novels.push({
            title,
            id: encodeId(link),
            author,
            img,
            latest_chapter_id: encodeId(latest_chapter),
            latest_chapter_title,
            label_hot,
            label_full,
            label_new,
          });
        }
      });

      return hot_novels;
    });

    res.status(200).json(data);
  } catch (err) {
    res.status(403).json({ error: err.message });
  }
};
export const GET_ALL_LATEST_NOVELS = (req, res, next) => {
  const { page } = req.params;
  const latest_url = "https://novelfull.net/latest-release-novel";

  axios
    .get(latest_url + "?page=" + page, {
      headers: {
        "User-Agent": agents[Math.floor(Math.random() * agents.length)],
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3",
        "Accept-Encoding": "gzip, deflate, br",
        "Accept-Language": "en-US,en;q=0.9,en;q=0.8",
      },
    })
    .then((response) => {
      const html = response.data;
      const $ = cheerio.load(html);
      const latest_novels = [];
      let pagination = $(".pagination-container")
        ?.find(".last > a")
        .attr("href")
        ?.split("page=")[1];

      if (pagination === undefined) {
        pagination = $(".pagination-container")
          ?.find("ul.pagination-sm > li:nth-of-type(9)")
          .text();
      }

      latest_novels.push({ pagination: parseInt(pagination) });

      $(".list.list-truyen > .row", html).each(function () {
        const title = $(this).find(".truyen-title").text();
        const link = url + $(this).find(".truyen-title > a").attr("href");
        const author = $(this).find("span.author").text();
        const img = url + $(this).find("img").attr("src");
        const latest_chapter =
          url + $(this).find(".text-info").find("a").attr("href");
        const latest_chapter_title = $(this)
          .find(".text-info")
          .find("a")
          .attr("title");
        const label_hot = $(this).find(".label-hot").get(0) ? true : false;
        const label_full = $(this).find(".label-full").get(0) ? true : false;
        const label_new = $(this).find(".label-new").get(0) ? true : false;

        if (
          title === "" ||
          link === "" ||
          author === "" ||
          img === "" ||
          latest_chapter === ""
        ) {
          return;
        } else {
          latest_novels.push({
            title,
            link,
            author,
            img,
            latest_chapter,
            latest_chapter_title,
            label_hot,
            label_full,
            label_new,
          });
        }
      });

      res.status(200).json(latest_novels);
    })
    .catch((err) => res.status(403).json({ error: err }));
};
export const GET_ALL_COMPLETED_NOVELS = (req, res, next) => {
  const { page } = req.params;
  const completed_url = "https://novelfull.net/completed-novel";

  axios
    .get(completed_url + "?page=" + page, {
      headers: {
        "User-Agent": agents[Math.floor(Math.random() * agents.length)],
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3",
        "Accept-Encoding": "gzip, deflate, br",
        "Accept-Language": "en-US,en;q=0.9,en;q=0.8",
      },
    })
    .then((response) => {
      const html = response.data;
      const $ = cheerio.load(html);
      const completed_novels = [];
      let pagination = $(".pagination-container")
        ?.find(".last > a")
        .attr("href")
        ?.split("page=")[1];

      if (pagination === undefined) {
        pagination = $(".pagination-container")
          ?.find("ul.pagination-sm > li:nth-of-type(9)")
          .text();
      }

      completed_novels.push({ pagination: parseInt(pagination) });

      $(".list.list-truyen > .row", html).each(function () {
        const title = $(this).find(".truyen-title").text();
        const link = url + $(this).find(".truyen-title > a").attr("href");
        const author = $(this).find("span.author").text();
        const img = url + $(this).find("img").attr("src");
        const count = $(this).find(".text-info").text();
        const label_hot = $(this).find(".label-hot").get(0) ? true : false;
        const label_full = $(this).find(".label-full").get(0) ? true : false;
        const label_new = $(this).find(".label-new").get(0) ? true : false;

        if (
          title === "" ||
          link === "" ||
          author === "" ||
          img === "" ||
          count === ""
        ) {
          return;
        } else {
          completed_novels.push({
            title,
            link,
            author,
            img,
            count,
            label_hot,
            label_full,
            label_new,
          });
        }
      });

      res.status(200).json(completed_novels);
    })
    .catch((err) => res.status(403).json({ error: err }));
};

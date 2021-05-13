var axios = require('axios');
fs = require('fs');
const jsdom = require("jsdom");
const json2csv = require("json2csv");
const { JSDOM } = jsdom;

function delay(time) {
  return new Promise(resolve => setTimeout(resolve, time));
}


const getPage = async (page = 1, retry = 0) => {
  let result;
  console.log('page' , page)
  try {
    await delay(2000 * retry)
    result = await axios({
      method: 'get',
      url: `https://apps.shopify.com/browse/all?app_integration_pos=off&app_integration_shopify_checkout=off&page=${page}&pricing=all&requirements=off&sort_by=installed`,
    });
  } catch (err) {
    console.log('page' , page)
    console.log(err.message);
  }

  return result.data;
};

const getData = async () => {
  const data = [];
  for (let i = 1; i < 200; i++) {
    const appPage = await getPage(i);
    const { document } = (new JSDOM(appPage)).window;
    document.querySelectorAll(".ui-app-card").forEach(n => {

      const name = n.querySelector(".ui-app-card__name")?.innerHTML;
      const developer = n.querySelector(".ui-app-card__developer-name")?.innerHTML.replace('by ', "");
      const description = n.querySelector(".ui-app-card__details")?.innerHTML;
      const rating = n.querySelector(".ui-star-rating__rating")?.innerHTML.replace(/\<.*/gi, "");
      const reviews = n.querySelector(".ui-review-count-summary")?.innerHTML.replace(/^\(/gi, "").replace(/\<.*/gi, "");
      const pricing = n.querySelector(".ui-app-pricing")?.innerHTML;
      const link = n.querySelector("a")?.href;
      data.push({ name, developer, description, rating, reviews, pricing, link });
    });
    console.log(data.length);
    await delay(500);
  }

  fs.writeFile(`tester.json`, JSON.stringify(data), function (err) {
    if (err) return console.log(err);
    console.log('done');
  });

};


getData();

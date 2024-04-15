const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const axios = require('axios');

puppeteer.use(StealthPlugin());

(async () => {
    const browser = await puppeteer.launch({
        headless: true,
        executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe'
    });

    const page = await browser.newPage();
    // Tarayıcı boyutunu ayarla
    await page.setViewport({
        width: 1366,
        height: 800
    });
    await page.goto('https://www.isimtescil.net/domain/search', { waitUntil: 'networkidle2' });

    // Domains
    const domains = [
        "serkankuyu",
        "kelimeorgusu",
        "facebook"
    ];

    // Domain Result
    let result = [];

    // Start Info
    console.log("İsimtescil, domains search is start");

    // Percent
    const totalDomains = domains.length;
    let completedDomains = 0;

    for (const domain of domains) {

        // Search
        await page.type("body > section.bg-g-purple.w-full > div.container.mb-4 > div > div:nth-child(2) > form > div > input.box.form-control.rounded-3.fs-5", domain);

        // Click Button
        const button = "body > section.bg-g-purple.w-full > div.container.mb-4 > div > div:nth-child(2) > form > div > button";
        await page.waitForSelector(button);
        await page.click(button);

        // Results
        const tableSelector = ".table.domains-table tbody";
        await page.waitForSelector(tableSelector);

        const domainInfos = await page.evaluate(tableSelector => {
            const rows = document.querySelectorAll(`${tableSelector} tr`);

            rows.forEach(row => {
                const columns = row.querySelectorAll("td");
                if (columns.length !== 6) return;

                const domain = columns[0].querySelector("span")?.textContent.trim() || "";
                const discount = columns[3].querySelector("p")?.textContent.trim() || "";
                const priceDiscountElement = columns[4].querySelector("span.fs-4.text-black.fw-bold.ms-2");
                const priceOrijinalElement = columns[4].querySelector("span.fs-4.fw-semibold.text-decoration-line-through.text-secondary");
                const priceDiscount = priceDiscountElement ? priceDiscountElement.textContent.trim() : "";
                const priceOriginal = priceOrijinalElement ? priceOrijinalElement.textContent.trim() : "";
                const status = columns[2].querySelector("p")?.textContent.trim() || "";
                result.push({ domain, discount, priceDiscount, priceOriginal, status });
            });

            return result;
        }, tableSelector);

        // Add domainInfos to result array
        result = result.concat(domainInfos);

        // Increment completedDomains
        completedDomains++;

        // Calculate progress percentage
        const progressPercentage = (completedDomains / totalDomains) * 100;
        console.log(`Progress: ${progressPercentage.toFixed(0)}%`);

    }

    // if you want send mail
    console.log(result);


    // Over Info
    result.length > 0 ? console.log("İsimtescil, domains search is over") : "";

    // Close page
    await browser.close();

})(); 

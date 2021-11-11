// questo é il nostro server

//step 1
const PORT = process.env.PORT || 3000;
const express = require("express");
const axios = require("axios");

//step 2
const app = express();

//step 4
app.get("/", (req, res) => {
    console.log("GET req to route /");
    res.json("Welcome to my Music Albums API! 🎶");
});

//extras
const cheerio = require("cheerio");

const newspapers = [
    {
        name: "rollingstone",
        address: "https://www.rollingstone.com/music/",
        base: "",
    },
    {
        name: "rollingstone",
        address: "https://www.rollingstone.com/music/music-news/",
        base: "",
    },
    {
        name: "pitchfork",
        address: "https://pitchfork.com/news/?page=4",
        base: "https://pitchfork.com",
    },
    {
        name: "nme",
        address: "https://www.nme.com/news/music/",
        base: "",
    },
    {
        name: "billboard",
        address: "https://www.billboard.com/news",
        base: "",
    },
    {
        name: "allmusic",
        address: "https://www.allmusic.com/blog",
        base: "https://www.allmusic.com",
    },
    // {
    //     name: "musicnews",
    //     address: "https://www.music-news.com/news/",
    //     base: "",
    // },
];

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const articles = [];

newspapers.forEach((newspaper) => {
    axios.get(newspaper.address).then((response) => {
        const html = response.data;
        const $ = cheerio.load(html);
        // console.log("$🧨: ", $);

        let finalObj;
        // ho deciso di usare una var vuota, cosí da poter salvare i valori prima di fare un push
        //invece di avere un push in ogni caso, cosí posso personalizzare la logica per diverse strutture DOM e verificare i duplicati, vedi RollingStone che cerca 2 link

        if (newspaper.name === "rollingstone") {
            //solo per Rolling Stone

            $('h3:contains("album"), h3:contains("Album")', html).each(
                function () {
                    const title = $(this)
                        .text()
                        .replace(/\n\t\n\t/g, "");
                    const url = $(this).parent().parent().attr("href");

                    finalObj = {
                        title,
                        url: newspaper.base + url,
                        source: newspaper.name,
                    };

                    finalObj &&
                    articles.findIndex((x) => x.title == finalObj.title) === -1
                        ? articles.push(finalObj)
                        : console.log("Oggetto giá esistente!", finalObj);
                }
            );
        } else if (newspaper.name === "pitchfork") {
            //solo per Rolling Stone
            $('h2:contains("Album")', html).each(function () {
                const title = $(this).text();
                const url = $(this).parent().attr("href");

                finalObj = {
                    title,
                    url: newspaper.base + url,
                    source: newspaper.name,
                };
                finalObj &&
                articles.findIndex((x) => x.title == finalObj.title) === -1
                    ? articles.push(finalObj)
                    : console.log("Oggetto giá esistente!", finalObj);
            });
        } else if (newspaper.name === "billboard") {
            //solo per Billboard
            // mi torna dei link invalidi che non vedo nel DOM
            $('main a:contains("album"), main a:contains("Album")', html).each(
                function () {
                    const title = $(this).text();
                    const url = $(this).attr("href");

                    finalObj = {
                        title,
                        url: newspaper.base + url,
                        source: newspaper.name,
                    };
                    finalObj &&
                    articles.findIndex((x) => x.title == finalObj.title) === -1
                        ? articles.push(finalObj)
                        : console.log("Oggetto giá esistente!", finalObj);
                }
            );
        } else if (newspaper.name === "musicnews") {
            //solo per Music News

            $(
                'div.headline:contains("album"), div.headline:contains("Album")',
                html
            ).each(function () {
                const title = $(this).text();
                const url = $(this).parent().parent().attr("href");
                console.log("musicnews: ", $(this).text());

                finalObj = {
                    title,
                    url: newspaper.base + url,
                    source: newspaper.name,
                };
                finalObj &&
                articles.findIndex((x) => x.title == finalObj.title) === -1
                    ? articles.push(finalObj)
                    : console.log("Oggetto giá esistente!", finalObj);
            });
        } else if (newspaper.name === "nme") {
            //solo per nme
            //abbiamo un <a> contenente la parola album nell'header
            $(
                'h3.entry-title>a:contains("album"), h3.entry-title>a:contains("Album")',
                html
            ).each(function () {
                const title = $(this).text();
                const url = $(this).attr("href");

                finalObj = {
                    title,
                    url: newspaper.base + url,
                    source: newspaper.name,
                };
                finalObj &&
                articles.findIndex((x) => x.title == finalObj.title) === -1
                    ? articles.push(finalObj)
                    : console.log("Oggetto giá esistente!", finalObj);
            });
        } else {
            //per standard links

            // console.log("ELSE: ", newspaper);
            $('a:contains("album"), a:contains("Album")', html).each(
                function () {
                    const title = $(this).text();
                    const url = $(this).attr("href");

                    // articles.push({
                    //     title,
                    //     url: newspaper.base + url,
                    //     source: newspaper.name,
                    // });
                    finalObj = {
                        title,
                        url: newspaper.base + url,
                        source: newspaper.name,
                    };
                    finalObj &&
                    articles.findIndex((x) => x.title == finalObj.title) === -1
                        ? articles.push(finalObj)
                        : console.log("Oggetto giá esistente!", finalObj);
                }
            );
        }

        console.log("finalObj", finalObj);
        // here you can check specific property for an object whether it exist in your array or not
        // findIndex funziona esattamente come .map o .filter
        // praticamente cerca se un'oggetto con lo stesso title esiste, in tal caso non lo aggiunge
    });

    // OK: RollingStone, nme, billboard, allmusic(sembra ok),
    // NOT WORKING: musicnews(crashed),
    // NOT CHECKED: pitchfork(sembra ok),
});

app.get("/news", (req, res) => {
    res.json(articles);
});

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

app.get("/news/:newspaperId", async (req, res) => {
    const newspaperId = req.params.newspaperId;
    let specificArticles = [];

    const newspaperAddresses = newspapers.filter(
        (newspaper) => newspaper.name === newspaperId
    );
    console.log("newspaperAddresses", newspaperAddresses);

    newspaperAddresses.forEach((newspaper) => {
        axios
            .get(newspaper.address)
            .then((response) => {
                const html = response.data;
                const $ = cheerio.load(html);

                if (newspaper.name === "rollingstone") {
                    //solo per Rolling Stone

                    $('h3:contains("album"), h3:contains("Album")', html).each(
                        function () {
                            const title = $(this)
                                .text()
                                .replace(/\n\t\n\t/g, "");
                            const url = $(this).parent().parent().attr("href");

                            finalObj = {
                                title,
                                url: newspaper.base + url,
                                source: newspaper.name,
                            };

                            finalObj &&
                            specificArticles.findIndex(
                                (x) => x.title == finalObj.title
                            ) === -1
                                ? specificArticles.push(finalObj)
                                : console.log(
                                      "Oggetto giá esistente! 🪁",
                                      finalObj
                                  );
                        }
                    );
                } else {
                    $('a:contains("album")', html).each(function () {
                        const title = $(this).text();
                        const url = $(this).attr("href");
                        specificArticles.push({
                            title,
                            url: newspaper.base + url,
                            source: newspaper.name,
                        });
                    });
                }
            })
            .catch((err) => console.log("ERROR in reqHandler :", err));
    });
    res.json(specificArticles);
});

//step 3
app.listen(PORT, () => console.log(`server is running on PORT ${PORT}`));

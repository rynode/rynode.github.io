'use strict';

(function () {
    const IFRAMES = {
        'videopress': {
            openTag: (videoId) => '<div style="left: 0; width: 100%; height: 0; position: relative; padding-bottom: 56.2493%;"><iframe src="https://videopress.com/embed/' + videoId + '" style="border: 0; top: 0; left: 0; width: 100%; height: 100%; position: absolute;" allowfullscreen scrolling="no">',
            closeTag: () => '</iframe></div>'
        },
        'vimeo': {
            openTag: (videoId) => '<div style="left: 0; width: 100%; height: 0; position: relative; padding-bottom: 56.2493%;"><iframe src="https://player.vimeo.com/video/' + videoId + '?byline=0&badge=0&portrait=0&title=0" style="border: 0; top: 0; left: 0; width: 100%; height: 100%; position: absolute;" allowfullscreen scrolling="no">',
            closeTag: () => '</iframe></div>'
        },
        'vine': {
            openTag: (videoId) => '<div style="left: 0; width: 100%; height: 0; position: relative; padding-bottom: 100%;"><iframe src="https://vine.co/v/' + videoId + '/embed/simple" style="border: 0; top: 0; left: 0; width: 100%; height: 100%; position: absolute;" allowfullscreen>',
            closeTag: () => '</iframe></div>'
        },
        'wistia': {
            openTag: (videoId) => '<div style="left: 0; width: 100%; height: 0; position: relative; padding-bottom: 56.2493%;"><iframe src="https://fast.wistia.net/embed/iframe/' + videoId + '" style="border: 0; top: 0; left: 0; width: 100%; height: 100%; position: absolute;" allowfullscreen scrolling="no" allow="autoplay; encrypted-media">',
            closeTag: () => '</iframe></div>'
        },
        'youtube': {
            openTag: (videoId) => '<div style="left: 0; width: 100%; height: 0; position: relative; padding-bottom: 56.2493%;"><iframe src="https://www.youtube.com/embed/' + videoId + '?rel=0&showinfo=0" style="border: 0; top: 0; left: 0; width: 100%; height: 100%; position: absolute;" allowfullscreen scrolling="no" allow="autoplay; encrypted-media">',
            closeTag: () => '</iframe></div>'
        },
        'youtube-playlist': {
            openTag: (playlistId) => '<div style="left: 0; width: 100%; height: 0; position: relative; padding-bottom: 56.2493%;"><iframe src="https://www.youtube.com/embed/videoseries?list=' + playlistId + '" style="border: 0; top: 0; left: 0; width: 100%; height: 100%; position: absolute;" allowfullscreen scrolling="no" allow="autoplay; encrypted-media">',
            closeTag: () => '</iframe></div>'
        },
        'htmlvideo': {
            openTag: (videoId) => '<div style="left: 0; width: 100%; height: 0; position: relative; padding-bottom: 56.2493%;"><iframe src="https://rynode.root.sx:' + videoId + '" style="border: 0; top: 0; left: 0; width: 100%; height: 100%; position: absolute;" allowfullscreen scrolling="no" allow="autoplay; encrypted-media">',
            closeTag: () => '</iframe></div>'
        }
    };

    function iframify(href) {
        const videoContext = parseVideoId(href);

        if (videoContext) {
            const iframe = IFRAMES[videoContext.service];

            if (iframe) {
                return iframe.openTag(videoContext.id) + iframe.closeTag();
            }
        }

	return none;
    }

    function parseVideoId(str) {
        // remove surrounding whitespaces or linefeeds
        str = str.trim();

        // remove the '-nocookie' flag from youtube urls
        str = str.replace('-nocookie', '');

        // remove any leading `www.`
        str = str.replace('/www.', '/');

        // Try to handle google redirection uri
        if (/\/\/google/.test(str)) {
            // Find the redirection uri
            const matches = str.match(/url=([^&]+)&/);

            // Decode the found uri and replace current url string - continue with final link
            if (matches) {
                // Javascript can get encoded URI
                str = decodeURIComponent(matches[1]);
            }
        }

        if (/youtube|youtu\.be|i.ytimg\./.test(str)) {
            const playlistId = youtubePlaylist(str);
            if (playlistId) {
                return {
                    id: playlistId,
                    service: 'youtube-playlist'
                };
            } else {
                return {
                    id: youtube(str),
                    service: 'youtube'
                };
            }
        } else if (/vimeo/.test(str)) {
            return {
                id: vimeo(str),
                service: 'vimeo'
            };
        } else if (/vine/.test(str)) {
            return {
                id: vine(str),
                service: 'vine'
            };
        } else if (/videopress/.test(str)) {
            return {
                id: videopress(str),
                service: 'videopress'
            };
        } else if (/wistia\.com|wi\.st/.test(str)) {
            const regex = /(?:wistia\.com|wi\.st)\/(?:medias|embed)\/(.*)$/;
            const match = str.match(regex);

            if (match && match[1]) {
                return {
                    id: match[1],
                    service: 'wistia'
                };
            }

            return null;
        } else if (/rynode\.root\.sx/.test(str)) {
            const regex = /(?:rynode\.root\.sx)\:(\d+)(?:\/)?$/;
            const match = str.match(regex);

            if (match && match[1]) {
                return {
                    id: match[1],
                    service: 'htmlvideo'
                };
            }

            return null;
        } else {
            return null;
        }
    }

    /**
     * Get the vimeo id.
     * @param {string} str - the url from which you want to extract the id
     * @returns {string|undefined}
     */
    function vimeo(str) {
        if (str.indexOf('#') > -1) {
            str = str.split('#')[0];
        }
        if (str.indexOf('?') > -1) {
            str = str.split('?')[0];
        }

        let id;

        if (/https?:\/\/vimeo\.com\/[0-9]+$|https?:\/\/player\.vimeo\.com\/video\/[0-9]+$|https?:\/\/vimeo\.com\/channels|groups|album/igm.test(str)) {
            const arr = str.split('/');
            if (arr && arr.length) {
                id = arr.pop();
            }
        }

        return id;
    }

    /**
     * Get the vine id.
     * @param {string} str - the url from which you want to extract the id
     * @returns {string|undefined}
     */
    function vine(str) {
        const regex = /https:\/\/vine\.co\/v\/([a-zA-Z0-9]*)\/?/;
        const matches = regex.exec(str);
        return matches && matches[1];
    }

    /**
     * Get the Youtube Video id.
     * @param {string} str - the url from which you want to extract the id
     * @returns {string|undefined}
     */
    function youtube(str) {
        // shortcode
        const shortcode = /youtube:\/\/|https?:\/\/youtu\.be\//g;

        if (shortcode.test(str)) {
            const shortcodeid = str.split(shortcode)[1];
            return stripParameters(shortcodeid);
        }

        // /v/ or /vi/
        const inlinev = /\/v\/|\/vi\//g;

        if (inlinev.test(str)) {
            const inlineid = str.split(inlinev)[1];
            return stripParameters(inlineid);
        }

        // v= or vi=
        const parameterv = /v=|vi=/g;

        if (parameterv.test(str)) {
            const arr = str.split(parameterv);
            return arr[1].split('&')[0];
        }

        // v= or vi=
        const parameterwebp = /\/an_webp\//g;

        if (parameterwebp.test(str)) {
            const webp = str.split(parameterwebp)[1];
            return stripParameters(webp);
        }

        // embed
        const embedreg = /\/embed\//g;

        if (embedreg.test(str)) {
            const embedid = str.split(embedreg)[1];
            return stripParameters(embedid);
        }

        // user
        const userreg = /\/user\//g;

        if (userreg.test(str)) {
            const elements = str.split('/');
            return stripParameters(elements.pop());
        }

        // attribution_link
        const attrreg = /\/attribution_link\?.*v%3D([^%&]*)(%26|&|$)/;

        if (attrreg.test(str)) {
            return str.match(attrreg)[1];
        }
    }

    function youtubePlaylist(str) {
        const reg = new RegExp("[&?]list=([a-z0-9_-]+)", "i");
        const match = reg.exec(str);

        if (match && match[1].length > 0) {
            return match[1];
        }

        return null;
    }

    /**
     * Get the VideoPress id.
     * @param {string} str - the url from which you want to extract the id
     * @returns {string|undefined}
     */
    function videopress(str) {
        let idRegex;

        if (str.indexOf('embed') > -1) {
            idRegex = /embed\/(\w{8})/;
            return str.match(idRegex)[1];
        }

        idRegex = /\/v\/(\w{8})/;
        return str.match(idRegex)[1];
    }

    /**
     * Strip away any parameters following `?` or `/`
     * @param str
     * @returns {*}
     */
    function stripParameters(str) {
        // Split parameters or split folder separator
        if (str.indexOf('?') > -1) {
            return str.split('?')[0];
        } else if (str.indexOf('/') > -1) {
            return str.split('/')[0];
        }
        return str;
    }


    if (typeof exports !== 'undefined') {
        if (typeof module !== 'undefined' && module.exports) {
            exports = module.exports = iframify;
        }
        exports.iframify = iframify;
    } else {
        window.iframify = iframify;
    }
})();

export function spoilerPlugin(md) {
  md.renderer.rules.link_open = function (tokens, idx, options, env, self) {
    const token = tokens[idx];

    // Check if it's a #spoiler link
    const hrefIndex = token.attrIndex("href");
    if (hrefIndex !== -1 && token.attrs[hrefIndex][1] === "#spoiler") {
      const titleIndex = token.attrIndex("title");
      if (titleIndex !== -1) {
        const spoilerText = token.attrs[titleIndex][1];
        token.attrs[titleIndex][1] = "";

        // Store spoiler text in data attribute
        token.attrPush(["data-spoiler", spoilerText]);

        // Add onclick event to replace innerHTML with data-spoiler
        token.attrPush([
          "onclick",
          "event.preventDefault(); this.innerHTML = this.getAttribute('data-spoiler'); this.style.color='black'; this.style.cursor='default'; this.style.textDecoration='none';",
        ]);
      } else {
        token.attrPush([
          "onclick",
          "event.preventDefault(); this.innerHTML = ''; this.style.color='black'; this.style.cursor='default'; this.style.textDecoration='none';",
        ]);
      }
    }

    return self.renderToken(tokens, idx, options);
  };

  // Ensure the default inner text appears inside the link
  md.renderer.rules.link_close = function () {
    return "🔍 Spoiler (Click to Reveal)</a>";
  };
}

export function resizeImagesPlugin(md) {
  md.renderer.rules.image = function (tokens, idx, options, env, self) {
    const token = tokens[idx];

    // Add width and height attributes
    token.attrSet("width", "256");
    token.attrSet("height", "256");

    return self.renderToken(tokens, idx, options);
  };
}

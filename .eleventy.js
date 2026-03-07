module.exports = function(eleventyConfig) {
  // Pass through static assets
  eleventyConfig.addPassthroughCopy("src/images");
  eleventyConfig.addPassthroughCopy("src/js");
  eleventyConfig.addPassthroughCopy("src/css/output.css");
  eleventyConfig.addPassthroughCopy("src/admin");
  eleventyConfig.addPassthroughCopy("src/CNAME");

  // Custom collections
  eleventyConfig.addCollection("blogPosts", function(collectionApi) {
    return collectionApi.getFilteredByGlob("src/blog/*.md").sort((a, b) => {
      return b.date - a.date;
    });
  });

  eleventyConfig.addCollection("podcastEpisodes", function(collectionApi) {
    return collectionApi.getFilteredByGlob("src/podcast/*.md").sort((a, b) => {
      return b.date - a.date;
    });
  });

  // Filters
  eleventyConfig.addFilter("dateFormat", function(date) {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  });

  eleventyConfig.addFilter("dateISO", function(date) {
    return new Date(date).toISOString().split('T')[0];
  });

  eleventyConfig.addFilter("jsonEscape", function(str) {
    if (!str) return '';
    return str.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
  });

  eleventyConfig.addFilter("limit", function(arr, limit) {
    return arr.slice(0, limit);
  });

  eleventyConfig.addFilter("filterByCategory", function(resources, category) {
    if (!category) return resources;
    return resources.filter(r => r.category && r.category.includes(category));
  });

  eleventyConfig.addFilter("filterByLocation", function(resources, location) {
    if (!location) return resources;
    return resources.filter(r => r.location === location);
  });

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data"
    },
    templateFormats: ["njk", "md", "html"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk"
  };
};

import { serve } from "https://deno.land/std@0.218.2/http/server.ts";
import { readFile, writeFile } from "node:fs/promises";

const LINKS_FILE = "./links.json";
const STYLE_FILE = "./style.css";
const JS_FILE = "./main.js";

interface Link {
		name: string;
		url: string;
}

interface Category {
		name: string;
		links: Link[];
}

interface LinksData {
		categories: Category[];
}

async function readLinks(): Promise<LinksData> {
		try {
				const data = await readFile(LINKS_FILE, { encoding: "utf-8" });
				return JSON.parse(data);
		} catch (error) {
				console.error("Error reading links file:", error);
				return { categories: [] };
		}
}

async function writeLinks(categories: Category[]): Promise<void> {
		try {
				await writeFile(LINKS_FILE, JSON.stringify({ categories }, null, 2), {
						encoding: "utf-8",
				});
				//console.log("Links updated successfully.");
		} catch (error) {
				console.error("Error writing links file:", error);
		}
}

async function handler(request: Request): Promise<Response> {
		const url = new URL(request.url);

		if (url.pathname === "/") {
				try {
						const html = await Deno.readTextFile("./index.html");
						return new Response(html, {
								headers: { "Content-Type": "text/html" },
						});
				} catch (error) {
						console.error("Error reading index.html:", error);
						return new Response("Error loading the homepage.", { status: 500 });
				}
		} else if (url.pathname === "/style.css") {
				try {
						const css = await Deno.readTextFile(STYLE_FILE);
						return new Response(css, {
								headers: { "Content-Type": "text/css" },
						});
				} catch (error) {
						console.error("Error reading style.css:", error);
						return new Response("Error loading the stylesheet.", { status: 500 });
				}
		} else if (url.pathname === "/favicon.ico") {
				try {
						const favicon = await Deno.readFile("./favicon.ico");
						return new Response(favicon, {
								headers: { "Content-Type": "image/x-icon" },
						});
				} catch (error) {
						console.error("Error reading favicon.ico:", error);
						// It's common for browsers to request favicon.ico, so a 404 might be more appropriate
						return new Response("Not found.", { status: 404 });
				}
		} else if (url.pathname === "/main.js") {
				try {
						const js = await Deno.readTextFile(JS_FILE);
						return new Response(js, {
								headers: { "Content-Type": "text/javascript" },
						});
				} catch (error) {
						console.error("Error reading main.js:", error);
						return new Response("Error loading the javascript.", { status: 500 });
				}
		} else if (url.pathname === "/api/links") {
				if (request.method === "GET") {
						const linksData = await readLinks();
						return new Response(JSON.stringify(linksData), {
								headers: { "Content-Type": "application/json" },
						});
				} else if (request.method === "POST") {
						try {
								const body = await request.json();
								if (body && body.category && body.name && body.url) {
										const { category, name, url } = body;
										const linksData = await readLinks();
										const categoryIndex = linksData.categories.findIndex((cat) => cat.name === category);

										if (categoryIndex !== -1) {
												if (!linksData.categories[categoryIndex].links) {
														linksData.categories[categoryIndex].links = [];
												}
												linksData.categories[categoryIndex].links.push({ name, url });
												await writeLinks(linksData.categories);
												return new Response(JSON.stringify({ message: "Link added successfully" }), {
														status: 201,
														headers: { "Content-Type": "application/json" },
												});
										} else {
												return new Response(`Category "${category}" not found.`, { status: 400 });
										}
								} else {
										return new Response("Invalid request body.", { status: 400 });
								}
						} catch (error) {
								console.error("Error processing POST request:", error);
								return new Response("Error processing the request.", { status: 500 });
						}
				} else {
						return new Response("Method not allowed.", { status: 405 });
				}
		} else if (url.pathname === "/api/categories") {
				if (request.method === "POST") {
						try {
								const body = await request.json();
								if (body && body.name) {
										const newCategoryName = body.name.trim();
										if (newCategoryName) {
												const linksData = await readLinks();
												const categoryExists = linksData.categories.some(
														(cat) => cat.name.toLowerCase() === newCategoryName.toLowerCase()
												);

												if (!categoryExists) {
														linksData.categories.push({ name: newCategoryName, links: [] });
														await writeLinks(linksData.categories);
														return new Response(JSON.stringify({ message: "Category added successfully" }), {
																status: 201,
																headers: { "Content-Type": "application/json" },
														});
												} else {
														return new Response(`Category "${newCategoryName}" already exists.`, { status: 409 });
												}
										} else {
												return new Response("Category name cannot be empty.", { status: 400 });
										}
								} else {
										return new Response("Invalid request body. Missing 'name'.", { status: 400 });
								}
						} catch (error) {
								console.error("Error processing POST request for /api/categories:", error);
								return new Response("Error processing the request.", { status: 500 });
						}
				} else {
						return new Response("Method not allowed.", { status: 405 });
				}
		} else if (url.pathname === "/api/reorder-links" && request.method === "POST") {
				try {
						const body = await request.json();
						if (body && body.category && Array.isArray(body.order)) {
								const { category, order } = body;
								const linksData = await readLinks();
								const categoryIndex = linksData.categories.findIndex((cat) => cat.name === category);

								if (categoryIndex !== -1) {
										// Create a new array of links based on the provided order
										const orderedLinks: Link[] = [];
										const existingLinks = linksData.categories[categoryIndex].links;

										// Create a map of existing links for faster lookup (by name, assuming unique names for now)
										const existingLinksMap = new Map(existingLinks.map(link => [link.name, link]));

										// Iterate through the ordered names and find the corresponding link
										for (const linkName of order) {
												const foundLink = existingLinksMap.get(linkName);
												if (foundLink) {
														orderedLinks.push(foundLink);
												}
										}

										// Update the category's links with the new order
										linksData.categories[categoryIndex].links = orderedLinks;
										await writeLinks(linksData.categories);

										return new Response(JSON.stringify({ message: `Links in category "${category}" reordered successfully.` }), {
												status: 200,
												headers: { "Content-Type": "application/json" },
										});
								} else {
										return new Response(`Category "${category}" not found.`, { status: 400 });
								}
						} else {
								return new Response("Invalid request body. Missing 'category' or 'order'.", { status: 400 });
						}
				} catch (error) {
						console.error("Error processing POST request for /api/reorder-links:", error);
						return new Response("Error processing the request.", { status: 500 });
				}
		} else if (url.pathname === "/api/reorder-categories" && request.method === "POST") {
				try {
						const body = await request.json();
						if (body && Array.isArray(body.order)) {
								const { order } = body;
								const linksData = await readLinks();

								// Assuming the client-side sends { order: [...], oldName: "...", newName: "..." }
								const oldName = body.oldName;
								const newName = body.newName;

								// Update the category name in the server data
								if (oldName && newName) {
										linksData.categories = linksData.categories.map(cat =>
												cat.name === oldName ? { ...cat, name: newName } : cat
										);
								}

								const orderedCategories: Category[] = [];
								const existingCategoriesMap = new Map(linksData.categories.map(cat => [cat.name, cat]));

								for (const categoryName of order) {
										const foundCategory = existingCategoriesMap.get(categoryName);
										if (foundCategory) {
												orderedCategories.push(foundCategory);
										}
								}

								linksData.categories = orderedCategories;
								await writeLinks(linksData.categories);

								return new Response(JSON.stringify({ message: "Categories reordered successfully." }), {
										status: 200,
										headers: { "Content-Type": "application/json" },
								});
						} else {
								return new Response("Invalid request body. Missing 'order' array.", { status: 400 });
						}
				} catch (error) {
						console.error("Error reordering categories:", error);
						return new Response(JSON.stringify({ error: "Failed to reorder categories." }), { status: 500, headers: { "Content-Type": "application/json" } });
				}
		} else if (url.pathname === "/api/move-link" && request.method === "POST") {
				try {
						const body = await request.json();
						if (body && body.linkName && body.sourceCategory && body.targetCategory) {
								const { linkName, sourceCategory, targetCategory } = body;
								const linksData = await readLinks();

								let movedLink = null;
								let sourceCategoryIndex = -1;
								let targetCategoryIndex = -1;

								// Find the link in the source category and store its data
								linksData.categories = linksData.categories.map((cat, index) => {
										if (cat.name === sourceCategory) {
												sourceCategoryIndex = index;
												cat.links = cat.links.filter(link => {
														if (link.name === linkName) {
																movedLink = link;
																return false; // Remove the link from the source category
														}
														return true;
												});
										} else if (cat.name === targetCategory) {
												targetCategoryIndex = index;
										}
										return cat;
								});

								// Add the link to the target category if found
								if (movedLink && targetCategoryIndex !== -1) {
										linksData.categories[targetCategoryIndex].links.push(movedLink);
										await writeLinks(linksData.categories);
										return new Response(JSON.stringify({ message: `Link "${linkName}" moved to "${targetCategory}".` }), {
												status: 200,
												headers: { "Content-Type": "application/json" },
										});
								} else if (!movedLink) {
										return new Response(JSON.stringify({ error: `Link "${linkName}" not found in category "${sourceCategory}".` }), {
												status: 404,
												headers: { "Content-Type": "application/json" },
										});
								} else {
										return new Response(JSON.stringify({ error: `Target category "${targetCategory}" not found.` }), {
												status: 404,
												headers: { "Content-Type": "application/json" },
										});
								}
						} else {
								return new Response("Invalid request body. Missing 'linkName', 'sourceCategory', or 'targetCategory'.", { status: 400 });
						}
				} catch (error) {
						console.error("Error moving link:", error);
						return new Response(JSON.stringify({ error: "Failed to move link." }), { status: 500, headers: { "Content-Type": "application/json" } });
				}
		} else {
				return new Response("Not found.", { status: 404 });
		}
}

console.log("Server listening on http://localhost:8083");
await serve(handler, { port: 8083 });

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
				console.log("Links updated successfully.");
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
		} else {
				return new Response("Not found.", { status: 404 });
		}
}

console.log("Server listening on http://localhost:8083");
await serve(handler, { port: 8083 });

import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { imageBase64, filename } = await req.json();

        if (!imageBase64 || !filename) {
            return NextResponse.json({ error: 'Missing image or filename' }, { status: 400 });
        }

        const token = process.env.GITHUB_TOKEN;
        const owner = process.env.GITHUB_REPO_OWNER;
        const repo = process.env.GITHUB_REPO_NAME;

        if (!token || !owner || !repo) {
            return NextResponse.json({ error: 'Server misconfiguration: GitHub credentials missing' }, { status: 500 });
        }

        // Prepare GitHub API request — use random ID to prevent conflicts
        const randomId = Math.random().toString(36).substring(2, 10);
        const path = `public/uploads/${Date.now()}_${randomId}_${filename.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;

        // Remove the data URL prefix if present (e.g., "data:image/png;base64,")
        const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');

        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: `Upload ${filename} via Admin Portal`,
                content: base64Data,
                branch: 'main'
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("GitHub API Error:", data);
            return NextResponse.json({ error: data.message || 'Error uploading to GitHub' }, { status: response.status });
        }

        // Construct the raw URL for the image
        const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/main/${path}`;

        return NextResponse.json({ success: true, url: rawUrl });
    } catch (error) {
        console.error("Upload API Route Error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

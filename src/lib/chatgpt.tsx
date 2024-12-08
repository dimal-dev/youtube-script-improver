import OpenAI from "openai";
import {smartLog, smartLogString} from "@/lib/utilServer";
import prisma from "@/lib/db";

const openai = new OpenAI();

interface CleanResponse {
    id: string,
    content: string,
}

export async function processResponse(response: GPTMockType) {
    if (!response) {
        return;
    }
    const responseContent = response.choices[0].message.content + '\n';
    const regex = /(\[ID\-(?<id>\d+)\])\[Version [123]{1}\](?<content>.*?)\n/g

    const matches = responseContent.matchAll(regex)
    if (!matches) {
        return;
    }

    const cleanResponses: CleanResponse[] = [...matches].map(r => {
        const id = typeof r.groups?.id === 'undefined' ? '' : r.groups.id;
        const content = typeof r.groups?.content === 'undefined' ? '' : r.groups.content.trim();
        return {
            id,
            content
        }
    });

    const responsesGrouped: { [id: string]: CleanResponse[] } = {};
    for (const response of cleanResponses) {
        if (!(response.id in responsesGrouped)) {
            responsesGrouped[response.id] = []
        }

        const containsResponseWithSameContent = responsesGrouped[response.id].some(i => i.content === response.content);
        if (!containsResponseWithSameContent) {
            responsesGrouped[response.id].push({...response});
        }
    }

    const scriptLineIdListThatHasImprovements: number[] = []
    for (const id in responsesGrouped) {
        if (!responsesGrouped.hasOwnProperty(id)) {
            continue;
        }
        const subResponses = responsesGrouped[id];
        const toInsert = [];
        for (const subResponse of subResponses) {
            toInsert.push({
                scriptLineId: parseInt(id),
                content: subResponse.content,
            });
        }
        const result = await prisma.scriptLineImprovement.createMany({
            data: toInsert
        });
        if (result.count > 0) {
            scriptLineIdListThatHasImprovements.push(parseInt(id))
        }
    }

    smartLog(cleanResponses, 'cleanResponses')
    smartLog(responsesGrouped, 'responsesGrouped')
    smartLog(scriptLineIdListThatHasImprovements, 'scriptLineIdListThatHasImprovements')

    if (scriptLineIdListThatHasImprovements.length > 0) {
        const res = await prisma.scriptLine.updateMany({
            where: {
                id: {in: scriptLineIdListThatHasImprovements}
            },
            data: {
                hasImprovements: true,
            }
        });
    }
}

export async function improve(lines: { id: number, content: string }[]) {
    if (lines.length < 1) {
        return;
    }
    const scriptChunk = lines
        .map(({id, content}) => `[ID-${id}] ${content}`)
        .join('\n').trim();
    if (scriptChunk.length < 1) {
        return;
    }
    smartLogString(scriptChunk, 'chunk');


    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: `
You are a professional teacher who helps improve English language scripts, especially for beginner coding lessons, ensuring proper grammar, clarity, and teaching best practices.
Make sure the language is American English, simple and easy to understand for beginner learners.
Here is a script for a screencast video.
Each sentence has a unique identifier, make sure you include the identifier from the original sentence at the beginning of the improved one.
Please improve the script for American English, grammar, language simplicity, better understandability and teaching best practices.
Provide me 3 or less improved versions of each sentence trying different teaching best practices.
Only provide an improved version when it offers a significally improvements or contains improper grammar.
If there is nothing important to be improved, you can skip it and provide less than 3 versions or even no versions at all.
Don't fix punctuation mistakes.
Include id from the original version before each version. Don't group them by id.
For example:
[ID-1][Version 1] improved sentence.
[ID-1][Version 2] improved sentence.
[ID-1][Version 3] improved sentence.
[ID-2][Version 1] improved sentence.
and so on.`,
                },
                {
                    role: "user",
                    content: `
                        After this sentence goes the next part of the script.
                            ${scriptChunk}
                          `.trim(),
                },
                // {
                //     role: "user",
                //     content: `
                //         After this sentence goes the next part of the script.
                //             ${scriptChunks[1]}
                //           `.trim(),
                // },
                // {
                //     role: "user",
                //     content: `
                //         After this sentence goes the next part of the script.
                //             ${scriptChunks[2]}
                //           `.trim(),
                // },
            ],
        });

        console.log(response);
        console.log(JSON.stringify(response));
        smartLog(response, 'gpt_response');

        processResponse(response);

        return response;
    } catch (error) {
        console.error("Error improving script:", error);
        return null;
    }
}

export function test() {
    const script = `
[ID-1]  This is what we will create in this part of the course. (Updated) More cool content. No way 2
[ID-2]  It’s a quite complex webpage with plenty of different elements, some of which are interactive like this search bar that expands on focus.
[ID-3]  Here we’ll have an opportunity to apply what we’ve learned so far in this course.
[ID-4]  Your first reaction might be “Wow, this is a very complex webpage, it’s too much, how you would even create a webpage like this?"
[ID-5]  But don’t get overwhelmed or discouraged.
[ID-6]  If we look closer, we’ll see that this big and complex webpage actually consists of  smaller pieces.
[ID-7]  For example this logo is an image and we know how to add and style images.
[ID-8]  Then these sidebar menu items consist of an image and some text.
[ID-9]  And so on.
[ID-10]  So they way I approach creating complex pages like this one is splitting them into smaller pieces that I know how to create.
[ID-11]  It’s like in lego you take small parts and assemble big things.
[ID-12]  And this is what we’re gonna do, we’ll build this complex webpage from smaller pieces, so html elements that we already know how to create and style.
[ID-13]  Great, before we start, make sure that you open the following URL in Chrome.
[ID-14]  And then click on the Reddit Clone webdev link.
[ID-15]  To open this webpage which is the finished version of what we’re gonna be creating.
[ID-16]  We’ll use it to check if we’re on the right track.
[ID-17]  There is also this page that has all the images we need in a convenient format.
[ID-18]  You can use it to download or copy an absolute URL to an image for our project.
[ID-19]  Notice also that there is this Hades version of the project.
[ID-20]  You will work on it after we finish the webdev page.`;


    async function improveScript(script: string) {
        try {
            const response = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    {
                        role: "system",
                        content: `
You are a professional teacher who helps improve English language scripts, especially for beginner coding lessons, ensuring proper grammar, clarity, and teaching best practices.
Make sure the language is American English, simple and easy to understand for beginner learners.
Here is a script for a screencast video.
Each sentence has a unique identifier, make sure you include the identifier from the original sentence at the beginning of the improved one.
Please improve the script for American English, grammar, language simplicity, better understandability and teaching best practices.
Provide me 3 improved versions of each sentence trying different teaching best practices.
Include id from the original version before each version. Don't group them by id.
For example:
[ID-1][Version 1] improved sentence.
[ID-1][Version 2] improved sentence.
[ID-1][Version 3] improved sentence.
[ID-2][Version 1] improved sentence.
and so on.`,
                    },
                    {
                        role: "user",
                        content: `
                        After this sentence goes the script.
                            ${script}
                          `.trim(),
                    },
                ],
            });

            // return response.data.choices[0].message.content;
            return response;
        } catch (error) {
            console.error("Error improving script:", error);
            return null;
        }
    }

    improveScript(script).then((result) => {
        console.log('\n')
        console.log('\n')
        console.log('\n')
        console.log(result);

        console.log('\n')
        console.log('\n')
        console.log('\n')

        console.log(JSON.stringify(result));
    }).catch(error => {
        console.error("Error improving script:", error);
    })
}

type GPTMockType = (OpenAI.Chat.Completions.ChatCompletion & { _request_id?: string | null }) | null



export function getLastGPTResponse(): GPTMockType {
    return {
        "id": "chatcmpl-Abn4kp7oZ6P9WTskFgb8FQ1tf5jfH",
        "object": "chat.completion",
        "created": 1733570146,
        "model": "gpt-4o-mini-2024-07-18",
        "choices": [
            {
                "index": 0,
                "message": {
                    "role": "assistant",
                    "content": "[ID-21][Version 1] This will give you a chance to practice everything we learn here.  \n[ID-21][Version 2] This is so you can practice all the things we will learn together.  \n[ID-21][Version 3] This will allow you to practice everything we cover in this lesson.  \n\n[ID-22][Version 1] Now, let's return to our reference page.  \n[ID-22][Version 2] Let's go back to the reference page now.  \n[ID-22][Version 3] Now, we will head back to our reference page.  \n\n[ID-23][Version 1] Let's start creating this now.  \n[ID-23][Version 2] Now, we will see how to begin creating this.  \n[ID-23][Version 3] Let's explore how we can start making this.  \n\n[ID-24][Version 1] First, we need to create an HTML file with the correct HTML5 page structure.  \n[ID-24][Version 2] First, we will need to set up an HTML file using a proper HTML5 structure.  \n[ID-24][Version 3] First, we have to make an HTML file that follows the correct HTML5 page structure.  \n\n[ID-25][Version 1] Let's create that file now.  \n[ID-25][Version 2] Now, we will create that file.  \n[ID-25][Version 3] It's time to create the file.  \n\n[ID-26][Version 1] In web development, it's standard to name the main page of your website \"index.html.\"  \n[ID-26][Version 2] The main page of your website is usually called \"index.html\" in web development.  \n[ID-26][Version 3] It's common in web development to name the main page \"index.html.\"  \n\n[ID-27][Version 1] Next, type an exclamation mark and press the Tab key.  \n[ID-27][Version 2] Now, type an exclamation point and hit the Tab key.  \n[ID-27][Version 3] Next, let's type an exclamation mark and then press the Tab button.  \n\n[ID-28][Version 1] This will generate a proper HTML5 structure for our page.  \n[ID-28][Version 2] This will create the correct HTML5 structure for our page.  \n[ID-28][Version 3] This action will produce the proper HTML5 structure for our page.  \n\n[ID-29][Version 1] We'll set the title of our page to \"Reddit Clone.\"  \n[ID-29][Version 2] Let's name the title of our page \"Reddit Clone.\"  \n[ID-29][Version 3] We will change the title to \"Reddit Clone.\"  \n\n[ID-30][Version 1] Now, let's open our page in the browser.  \n[ID-30][Version 2] Let's take a look at our page by opening it in the browser.  \n[ID-30][Version 3] Now we will open our page in a web browser.  \n\n[ID-31][Version 1] There you go, we have an empty page ready to fill with content.  \n[ID-31][Version 2] Here’s our empty page where we can start adding content.  \n[ID-31][Version 3] Look at that, we now have an empty page to fill with information.  \n\n[ID-32][Version 1] I usually start by breaking pages into the largest meaningful sections.  \n[ID-32][Version 2] I normally break down pages into big sections that make sense.  \n[ID-32][Version 3] Typically, I divide pages into the biggest parts that are logical.  \n\n[ID-33][Version 1] For instance, I would divide this page into a header, which is this area.  \n[ID-33][Version 2] For example, I would split this page into a header, which is what we see here.  \n[ID-33][Version 3] In this case, I would separate this page into a header, which is right up here.  \n\n[ID-34][Version 1] The sidebar, located here, is scrollable and contains a lot of content.  \n[ID-34][Version 2] The sidebar, which is this area, scrolls and holds a lot of information.  \n[ID-34][Version 3] This area, the sidebar, can scroll and has plenty of content inside.  \n\n[ID-35][Version 1] Then, there is the main content area on the page.  \n[ID-35][Version 2] Next, we have the main content section of the page.  \n[ID-35][Version 3] Finally, we have the third area for the main content on this page.  \n\n[ID-36][Version 1] It includes a subreddit banner, a list of posts, and an aside for more subreddit information.  \n[ID-36][Version 2] This area has a subreddit banner, a list of posts, and extra information about the subreddit on the side.  \n[ID-36][Version 3] This includes a subreddit banner, a list of posts, and additional information about the subreddit on the right.  \n\n[ID-37][Version 1] So, I will split this page into three main sections: the header, the sidebar, and the main content.  \n[ID-37][Version 2] Thus, I am dividing this page into three big parts: the header, the sidebar, and the main content area.  \n[ID-37][Version 3] Therefore, I plan to divide this page into three essential sections: the header, the sidebar, and the main content.  \n\n[ID-38][Version 1] We’ll start with the header, but let's create containers for all the sections first.  \n[ID-38][Version 2] We will begin with the header, but it's helpful to create containers for all the main sections first.  \n[ID-38][Version 3] Although we will begin with the header, it’s smart to set up containers for all the sections first.  \n\n[ID-39][Version 1] It’s usually easier to create HTML elements first and then style them with CSS.  \n[ID-39][Version 2] Generally, it's simpler to create the HTML elements first and then add styles with CSS.  \n[ID-39][Version 3] Typically, it's best to start by making HTML elements before styling them with CSS.  \n\n[ID-40][Version 1] Now, how do we decide which elements to use for these three areas?  \n[ID-40][Version 2] So, how do we choose which elements to use for these three sections?  \n[ID-40][Version 3] So, how do we determine which elements to select for these three areas?  \n\n[ID-41][Version 1] We can see that each area contains many different elements.  \n[ID-41][Version 2] Each area has various elements that we can identify.  \n[ID-41][Version 3] We can notice that all three areas have many different elements inside.  \n\n[ID-42][Version 1] For instance, the header contains a logo, which is an image, and a search bar.  \n[ID-42][Version 2] For example, the header includes a logo (an image), a search bar, and more.  \n[ID-42][Version 3] The header, for instance, has a logo as an image, a search bar, and other elements.  \n\n[ID-43][Version 1] The sidebar contains links and buttons.  \n[ID-43][Version 2] In the sidebar, we can find links and buttons.  \n[ID-43][Version 3] The sidebar has various links and buttons.  \n\n[ID-44][Version 1] The main content section includes images, text, buttons, and more.  \n[ID-44][Version 2] In the main content area, we can see images, text, buttons, and other elements.  \n[ID-44][Version 3] This section has images, text, buttons, and other content.  \n\n[ID-45][Version 1] This means we need to use HTML elements that can hold other elements.  \n[ID-45][Version 2] This tells us that we need to use HTML elements that serve as containers for other elements.  \n[ID-45][Version 3] This means we need to select HTML elements that act as containers for everything else.  \n\n[ID-46][Version 1] We already know that div and span are the most commonly used container elements.  \n[ID-46][Version 2] We know that 'div' and 'span' are the two most popular container elements.  \n[ID-46][Version 3] We already learned that the 'div' and 'span' elements are the most used for containers.  \n\n[ID-47][Version 1] Remember, 'div' elements are block-level, while 'span' elements are inline.  \n[ID-47][Version 2] Just to clarify, 'div' elements are block elements, and 'span' elements are inline elements.  \n[ID-47][Version 3] Keep in mind that 'div' elements are block-level, whereas 'span' elements are inline text elements.  \n\n[ID-48][Version 1] Great, that's a good start.  \n[ID-48][Version 2] That's a good point to remember.  \n[ID-48][Version 3] Excellent! That's a helpful observation.  \n\n[ID-49][Version 1] The next question is: “How do we know which element to use, like 'div' or 'span', for the header?”  \n[ID-49][Version 2] The next important question is: “How can we tell when to use 'div' or 'span' for the header?”  \n[ID-49][Version 3] The next question is, “How can we decide which element to choose, like 'div' or 'span,' for this header?”  \n\n[ID-50][Version 1] To answer this, notice that all three containers will have block elements inside them.  \n[ID-50][Version 2] To answer this question, notice that each of the three containers will include block elements inside.  \n[ID-50][Version 3] To figure this out, observe that all three containers will contain block elements within them.  ",
                    "refusal": null
                },
                "logprobs": null,
                "finish_reason": "stop"
            }
        ],
        "usage": {
            "prompt_tokens": 891,
            "completion_tokens": 2251,
            "total_tokens": 3142,
            "prompt_tokens_details": {
                "cached_tokens": 0,
                "audio_tokens": 0
            },
            "completion_tokens_details": {
                "reasoning_tokens": 0,
                "audio_tokens": 0,
                "accepted_prediction_tokens": 0,
                "rejected_prediction_tokens": 0
            }
        },
        "system_fingerprint": "fp_bba3c8e70b"
    }
}

export function getMockChatGPTResponse(): GPTMockType {
    return {
        "id": "chatcmpl-AaKtJMhmDgpzCmFXGRywCm0qlKetJ",
        "object": "chat.completion",
        "created": 1733223477,
        "model": "gpt-4o-mini-2024-07-18",
        "choices": [
            {
                "index": 0,
                "message": {
                    "role": "assistant",
                    "content": "[ID-1][Version 1]  In this part of the course, we will create an exciting project together!  \n[ID-1][Version 2]  This is our project for this section of the course, and it’s going to be fun!  \n[ID-1][Version 3]  Let’s take a look at what we will build in this part of the course!  \n\n[ID-2][Version 1]  This is a complex webpage with many different elements, including an interactive search bar that expands when you click on it.  \n[ID-2][Version 2]  We’re going to build a detailed webpage that has many elements, like a search bar that opens when you focus on it.  \n[ID-2][Version 3]  This webpage has various components, including an interactive search bar that gets bigger when you click in it.  \n\n[ID-3][Version 1]  Here, we will practice using what we have learned so far in this course.  \n[ID-3][Version 2]  This is a great chance to use the skills we have learned up to this point in the course.  \n[ID-3][Version 3]  We will now have the opportunity to apply the knowledge we’ve gained throughout this course.  \n\n[ID-4][Version 1]  You might be thinking, “Wow! This webpage looks really complicated. How can we create something like this?”  \n[ID-4][Version 2]  You may be feeling overwhelmed and thinking, “This webpage looks so complex! How can anyone make something like this?”  \n[ID-4][Version 3]  It’s normal to think, “This webpage seems super complicated! How on earth can we create it?”  \n\n[ID-5][Version 1]  Don’t worry or feel discouraged; we can handle this!  \n[ID-5][Version 2]  Just take a deep breath and don’t feel discouraged—this is doable!  \n[ID-5][Version 3]  Remember, it’s okay to feel surprised; just stay positive and keep going!  \n\n[ID-6][Version 1]  When we look closely, we notice that this big, complex webpage is made up of smaller parts.  \n[ID-6][Version 2]  If we examine it more carefully, we can see that this large webpage is actually made up of many smaller components.  \n[ID-6][Version 3]  By taking a closer look, we find that this complicated webpage consists of smaller pieces put together.  \n\n[ID-7][Version 1]  For instance, this logo is just an image, and we already know how to add and style images!  \n[ID-7][Version 2]  For example, the logo is an image, and we’ve learned how to add and style images before.  \n[ID-7][Version 3]  Take this logo, for example; it’s simply an image, and we know how to work with images!  \n\n[ID-8][Version 1]  The sidebar menu items also include images and text.  \n[ID-8][Version 2]  The items on the sidebar are made of both images and text.  \n[ID-8][Version 3]  These sidebar menu items are made up of an image and some text, which we can easily create.  \n\n[ID-9][Version 1]  There are many more elements like this.  \n[ID-9][Version 2]  And there are even more elements we will create!  \n[ID-9][Version 3]  Plus, there are many other parts we will explore!  \n\n[ID-10][Version 1]  My strategy for building complex pages like this is to break them down into smaller parts that I already know how to create.  \n[ID-10][Version 2]  I find that a good way to handle complex pages is to divide them into smaller sections that I am familiar with.  \n[ID-10][Version 3]  The way I tackle complex webpages is by breaking them down into smaller pieces that I know how to build.  \n\n[ID-11][Version 1]  It’s similar to building with Lego; you take small blocks and put them together to create something big.  \n[ID-11][Version 2]  Think of it like playing with Lego: you start with small pieces and connect them to make something larger.  \n[ID-11][Version 3]  Just like with Lego, you use small pieces to build something big and amazing!  \n\n[ID-12][Version 1]  That’s exactly what we will do: we’ll construct this complex webpage using smaller pieces that we already know how to create and style.  \n[ID-12][Version 2]  We will build this complicated webpage piece by piece using HTML elements that we are already familiar with.  \n[ID-12][Version 3]  And that’s our plan: we will create this complex webpage from smaller parts using the HTML elements we've already learned!  \n\n[ID-13][Version 1]  Before we start, please make sure to open this URL in your Chrome browser.  \n[ID-13][Version 2]  Great! Before we begin, please open the following link in Chrome.  \n[ID-13][Version 3]  Before we get started, ensure that you have this URL open in Chrome.  \n\n[ID-14][Version 1]  Next, click on the \"Reddit Clone webdev\" link.  \n[ID-14][Version 2]  After that, click on the link that says \"Reddit Clone webdev.\"  \n[ID-14][Version 3]  Now, go ahead and click on the link for \"Reddit Clone webdev.\"  \n\n[ID-15][Version 1]  This will take you to the completed version of what we will be creating together.  \n[ID-15][Version 2]  This will show you the finished version of the project we are going to create.  \n[ID-15][Version 3]  By doing this, you will see the final result of what we’re going to build together.  \n\n[ID-16][Version 1]  We can use this completed webpage to check our progress as we work.  \n[ID-16][Version 2]  We will refer to this webpage to make sure we stay on track while creating ours.  \n[ID-16][Version 3]  This finished webpage will help us verify if we are progressing correctly.  \n\n[ID-17][Version 1]  There is also a webpage that contains all the images we need, which is very helpful.  \n[ID-17][Version 2]  Additionally, there’s a page that has all the images we will need for our project in one place.  \n[ID-17][Version 3]  Don't forget, there is also a page that holds all the images we need, making it easy to access them.  \n\n[ID-18][Version 1]  You can download the images or copy the link to use in our project.  \n[ID-18][Version 2]  Feel free to download the images or copy the link to the images for our project.  \n[ID-18][Version 3]  You are welcome to download the images or grab the direct link to use in your project.  \n\n[ID-19][Version 1]  Also, notice that there’s a Hades version of the project available.  \n[ID-19][Version 2]  You might also see a Hades version of this project on the page.  \n[ID-19][Version 3]  Don’t forget to look for the Hades version of the project available for you.  \n\n[ID-20][Version 1]  After we finish the webdev page, you will work on the Hades version.  \n[ID-20][Version 2]  Once we complete the webdev page, you will get to work on the Hades version.  \n[ID-20][Version 3]  You will start working on the Hades version after we finish building the webdev page.",
                    "refusal": null
                },
                "logprobs": null,
                "finish_reason": "stop"
            }
        ],
        "usage": {
            "prompt_tokens": 685,
            "completion_tokens": 1733,
            "total_tokens": 2418,
            "prompt_tokens_details": {
                "cached_tokens": 0,
                "audio_tokens": 0
            },
            "completion_tokens_details": {
                "reasoning_tokens": 0,
                "audio_tokens": 0,
                "accepted_prediction_tokens": 0,
                "rejected_prediction_tokens": 0
            }
        },
        "system_fingerprint": "fp_0705bf87c0"
    }
}


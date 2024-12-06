import OpenAI from "openai";

const openai = new OpenAI();

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
                        content: `You are a professional teacher who helps improve English language scripts, especially for beginner coding lessons, ensuring proper grammar, clarity, and teaching best practices.
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
                            Here is a script for a screencast video.
                
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


## Contributing to KaibanJS

We appreciate your interest in contributing to KaibanJS! Here are a few guidelines to help you get started:

For a video walkthrough of the contribution process, please watch our contribution guide video:

<div style="position: relative; padding-bottom: 62.5%; height: 0;"><iframe src="https://www.loom.com/embed/3ba1a391a03a45a9ab49b4981ef716c7?sid=fce0a5eb-07a2-4161-b17a-78009d2dc11b" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></iframe></div>

### Setting Up the Development Environment

Before you start contributing, you'll need to set up your development environment. Follow these steps:

1. **Prerequisites**: Ensure you have Node.js (version 14 or later) and npm installed on your system.

2. **Clone the Repository**: After forking, clone your fork of the KaibanJS repository:

   ```bash
   git clone https://github.com/kaiban-ai/KaibanJS.git
   cd KaibanJS
   ```

3. **Install Main Dependencies**: In the root directory, run:

   ```bash
   npm install
   ```

4. **Install Playground Dependencies**: Navigate to the playground/react folder and install its dependencies:

   ```bash
   cd playground/react
   npm install
   cd ../..
   ```

5. **Set Up Environment Variables**: In the playground/react directory, create a `.env.local` file and add the necessary API keys for the examples you plan to run:

   ```bash
   cd playground/react
   touch .env.local
   ```

   ```bash
   VITE_OPENAI_API_KEY=your_openai_api_key_here
   VITE_ANTHROPIC_API_KEY=your_anthropic_api_key_here
   VITE_GOOGLE_API_KEY=your_google_api_key_here
   VITE_MISTRAL_API_KEY=your_mistral_api_key_here
   ```

   Going back to the root directory, run:

   ```bash
   cd ../..
   ```

   Note: You only need to add the API keys for the services you'll be using in your examples.

6. **Compile the Library**: In the root directory, run:

   ```bash
   npm run dev
   ```

7. **Launch Storybook Playground**: Open another terminal window To open the Storybook playground, run:

   ```bash
   npm run play:sb
   ```

   This will start a local server and open your browser to the Storybook playground.

Now you're ready to start developing!

### How to Contribute

1. **Explore Issues**: Start by looking through the [issues](https://github.com/kaiban-ai/KaibanJS/issues) on GitHub. Pick an issue that interests you, or submit a new one if you have a new idea or have found a bug.

2. **Branch Creation**: Create a new branch in your local repository for your work.

3. **Development**: Make your changes in the newly created branch. You can use the Storybook playground to test your changes:

   - Create new stories in the `playground/react/src/stories` directory to test your use cases.
   - Refer to existing stories for examples of how to structure your new stories.

4. **Write Tests**: Ensure that all tests pass when you run `npm test`. Add new tests for new functionality if necessary.

5. **Document Your Changes**: Update the documentation to reflect any changes you've made. The documentation repository is located is [here](https://github.com/kaiban-ai/kaibanjs-docs.)

6. **Commit Messages**: Write clear and concise commit messages, describing what has changed and why.

7. **Pull Request**: Push your changes to your fork and submit a pull request to the main KaibanJS repository.

8. **Code Review**: Wait for the code review process and make any requested changes.

9. **Stay Updated**: Keep your pull request updated with the main branch.

### Community Guidelines

We're committed to providing a welcoming and inspiring community for all. Everyone participating in the KaibanJS project—including the codebase and issue tracker—is expected to follow our community guidelines:

- Be respectful of different viewpoints and experiences.
- Gracefully accept constructive criticism.
- Focus on what is best for the community and the project.
- Show empathy towards other community members.

### Questions?

If you have any questions, please don't hesitate to ask them in our [Discord channel](https://bit.ly/JoinAIChamps). We're more than happy to help guide you through the process.

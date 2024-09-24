const recordedRequests = [
  {
    url: "https://api.openai.com/v1/chat/completions",
    method: "POST",
    body: {
      model: "gpt-3.5-turbo-0125",
      temperature: 1,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
      n: 1,
      stream: false,
      messages: [
        {
          role: "system",
          content:
            "\n            Hello, You are Emma.\n            Your role is: Requirements Analyst.\n            Your background is: Business Analysis.\n            Your main goal is: Outline core functionalities and objectives for new features based on the founder’s input..\n            Tools available for your use: No specific tools assigned.\n            Task description: Analyze the founder's idea: I want to add a Referral program to our SAAS platform. and outline the necessary functionalities to implement it.\n        ",
        },
        {
          role: "user",
          content:
            "\n            Hi Emma, please complete the following task: Analyze the founder's idea: I want to add a Referral program to our SAAS platform. and outline the necessary functionalities to implement it..\n            Your expected output should be: \"A functional outline of the Founder Idea\".\n            This is the first task, so there's no input from a previous task.\n        ",
        },
      ],
    },
    response: {
      id: "chatcmpl-9lag66IMf6F1rCXPwARPWylnYlgmt",
      object: "chat.completion",
      created: 1721129434,
      model: "gpt-3.5-turbo-0125",
      choices: [
        {
          index: 0,
          message: {
            role: "assistant",
            content:
              "**Functional Outline of the Founder Idea: Referral Program for SAAS Platform**\n\n1. **User Registration and Account Creation:**\n   - Allow new users to easily register and create accounts on the SAAS platform.\n   - Include referral code/promo code field during registration.\n\n2. **Referral Tracking and Management:**\n   - Generate unique referral links for existing users to share with potential referrals.\n   - Track referrals using these unique links to attribute successful referrals.\n   - Provide a dashboard for users to monitor their referral activities and rewards.\n\n3. **Incentives and Rewards System:**\n   - Define rewards for successful referrals, such as discounts, credits, or premium features.\n   - Automatically apply rewards to user accounts when referrals meet specified criteria.\n\n4. **Communication and Notifications:**\n   - Send automated emails or notifications to users for successful referrals and reward notifications.\n   - Provide updates on referral program performance and upcoming promotions.\n\n5. **Analytics and Reporting:**\n   - Generate reports on referral program effectiveness, including conversion rates, ROI, and user engagement.\n   - Utilize analytics to refine the referral program and optimize results over time.\n\n6. **Integration and Compatibility:**\n   - Integrate referral program functionalities seamlessly into the existing SAAS platform interface.\n   - Ensure compatibility with different devices and operating systems for a smooth user experience.\n\n7. **Terms and Conditions:**\n   - Establish clear terms and conditions for the referral program to avoid misuse and confusion.\n   - Include guidelines on eligibility, rewards distribution, and program modifications.\n\n8. **Customer Support and Assistance:**\n   - Provide reliable customer support for users with questions or issues related to the referral program.\n   - Offer assistance in setting up referral links, tracking referrals, and claiming rewards.\n\n9. **Testing and Quality Assurance:**\n   - Conduct thorough testing of the referral program functionalities to identify and resolve any bugs or errors.\n   - Ensure the program functions correctly across different scenarios and user interactions.\n\n10. **Feedback Collection and Improvements:**\n   - Solicit feedback from users on their experience with the referral program.\n   - Use feedback to make continuous improvements and enhancements to the program.\n\nOverall, implementing a robust referral program on our SAAS platform will not only encourage user engagement and growth but also create a rewarding experience for our users and enhance brand loyalty.",
          },
          logprobs: null,
          finish_reason: "stop",
        },
      ],
      usage: {
        prompt_tokens: 178,
        completion_tokens: 468,
        total_tokens: 646,
      },
      system_fingerprint: null,
    },
  },
  {
    url: "https://api.openai.com/v1/chat/completions",
    method: "POST",
    body: {
      model: "gpt-3.5-turbo-0125",
      temperature: 1,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
      n: 1,
      stream: false,
      messages: [
        {
          role: "system",
          content:
            "\n            Hello, You are Lucas.\n            Your role is: Technical Writer.\n            Your background is: Technical Writing.\n            Your main goal is: Convert functional outlines into detailed technical specifications..\n            Tools available for your use: No specific tools assigned.\n            Task description: Create detailed technical specifications based on the functional outline provided. Include user stories, system requirements, and acceptance criteria.\n        ",
        },
        {
          role: "user",
          content:
            '\n            Hi Lucas, please complete the following task: Create detailed technical specifications based on the functional outline provided. Include user stories, system requirements, and acceptance criteria..\n            Your expected output should be: "A detailed technical specifications document.".\n            Incorporate the following findings and insights from previous tasks: "**Functional Outline of the Founder Idea: Referral Program for SAAS Platform**\n\n1. **User Registration and Account Creation:**\n   - Allow new users to easily register and create accounts on the SAAS platform.\n   - Include referral code/promo code field during registration.\n\n2. **Referral Tracking and Management:**\n   - Generate unique referral links for existing users to share with potential referrals.\n   - Track referrals using these unique links to attribute successful referrals.\n   - Provide a dashboard for users to monitor their referral activities and rewards.\n\n3. **Incentives and Rewards System:**\n   - Define rewards for successful referrals, such as discounts, credits, or premium features.\n   - Automatically apply rewards to user accounts when referrals meet specified criteria.\n\n4. **Communication and Notifications:**\n   - Send automated emails or notifications to users for successful referrals and reward notifications.\n   - Provide updates on referral program performance and upcoming promotions.\n\n5. **Analytics and Reporting:**\n   - Generate reports on referral program effectiveness, including conversion rates, ROI, and user engagement.\n   - Utilize analytics to refine the referral program and optimize results over time.\n\n6. **Integration and Compatibility:**\n   - Integrate referral program functionalities seamlessly into the existing SAAS platform interface.\n   - Ensure compatibility with different devices and operating systems for a smooth user experience.\n\n7. **Terms and Conditions:**\n   - Establish clear terms and conditions for the referral program to avoid misuse and confusion.\n   - Include guidelines on eligibility, rewards distribution, and program modifications.\n\n8. **Customer Support and Assistance:**\n   - Provide reliable customer support for users with questions or issues related to the referral program.\n   - Offer assistance in setting up referral links, tracking referrals, and claiming rewards.\n\n9. **Testing and Quality Assurance:**\n   - Conduct thorough testing of the referral program functionalities to identify and resolve any bugs or errors.\n   - Ensure the program functions correctly across different scenarios and user interactions.\n\n10. **Feedback Collection and Improvements:**\n   - Solicit feedback from users on their experience with the referral program.\n   - Use feedback to make continuous improvements and enhancements to the program.\n\nOverall, implementing a robust referral program on our SAAS platform will not only encourage user engagement and growth but also create a rewarding experience for our users and enhance brand loyalty."\n        ',
        },
      ],
    },
    response: {
      id: "chatcmpl-9lagBmZ9k0zBg6IKAv5G0BSyCQQfV",
      object: "chat.completion",
      created: 1721129439,
      model: "gpt-3.5-turbo-0125",
      choices: [
        {
          index: 0,
          message: {
            role: "assistant",
            content:
              "# Detailed Technical Specifications Document\n\n## User Stories:\n1. As a new user, I want to easily register and create an account on the SAAS platform.\n2. As an existing user, I want to have a referral code/promo code field available during registration.\n3. As an existing user, I want to generate unique referral links to share with potential referrals.\n4. As an existing user, I want to track successful referrals using unique links.\n5. As a user, I want to have a dashboard to monitor my referral activities and rewards.\n6. As a user, I want to receive rewards for successful referrals, such as discounts, credits, or premium features.\n7. As a user, I want rewards to be automatically applied to my account when referrals meet specified criteria.\n8. As a user, I want to receive automated emails or notifications for successful referrals and reward notifications.\n9. As a user, I want updates on referral program performance and upcoming promotions.\n10. As a user, I want to access reports on referral program effectiveness, conversion rates, ROI, and user engagement.\n11. As a user, I want the referral program seamlessly integrated into the existing SAAS platform interface.\n12. As a user, I want the referral program to be compatible with different devices and operating systems.\n13. As a user, I want clear terms and conditions for the referral program to avoid misuse and confusion.\n14. As a user, I want reliable customer support for questions or issues related to the referral program.\n15. As a user, I want assistance in setting up referral links, tracking referrals, and claiming rewards.\n16. As a user, I want thorough testing of the referral program functionalities to ensure bug-free operation.\n17. As a user, I want the program to function correctly across different scenarios and user interactions.\n18. As a user, I want to provide feedback on my experience with the referral program to help improve it continuously.\n\n## System Requirements:\n1. User Registration and Account Creation:\n   - Web-based registration form with fields for necessary user information.\n   - Database to store user account details securely.\n2. Referral Tracking and Management:\n   - Algorithm to generate unique referral links for each user.\n   - Database to track referral activities and successful referrals.\n3. Incentives and Rewards System:\n   - Logic to define and apply rewards based on referral criteria.\n   - Secure mechanism to apply rewards to user accounts.\n4. Communication and Notifications:\n   - Email or notification system for automated communications.\n   - Notification triggers for successful referrals and reward notifications.\n5. Analytics and Reporting:\n   - Reporting module to generate reports on referral program effectiveness.\n   - Analytics tools for monitoring conversion rates, ROI, and user engagement.\n6. Integration and Compatibility:\n   - Interface design for seamless integration with existing SAAS platform.\n   - Testing on different devices and operating systems for compatibility.\n7. Terms and Conditions:\n   - Legal documentation for clear terms and conditions of the referral program.\n   - Guidelines on eligibility, rewards distribution, and program modifications.\n8. Customer Support and Assistance:\n   - Helpdesk system for providing customer support on the referral program.\n   - Assistance tools for setting up referral links, tracking referrals, and claiming rewards.\n9. Testing and Quality Assurance:\n   - Test cases and scenarios for comprehensive testing of referral program functionalities.\n   - Bug tracking system for identifying and resolving errors.\n10. Feedback Collection and Improvements:\n   - Feedback collection mechanism for user input on the referral program.\n   - Process for implementing continuous improvements based on feedback.\n\n## Acceptance Criteria:\n- The user registration process should be completed within 2 minutes.\n- Unique referral links should be generated accurately and track referrals successfully.\n- Rewards should be applied automatically once referral criteria are met.\n- Users should receive email notifications for successful referrals and rewards.\n- Reports on referral program effectiveness should be accessible within the dashboard.\n- The referral program interface should be seamless with the existing platform.\n- Compliance with terms and conditions should be enforced throughout the program.\n- Customer support inquiries should be resolved within 24 hours.\n- The referral program should function without errors across different devices and operating systems.\n- Continuous feedback should be gathered and implemented for program improvements.\n\nBy following these detailed technical specifications, the referral program on our SAAS platform will be effectively implemented to encourage user engagement, growth, and brand loyalty.",
          },
          logprobs: null,
          finish_reason: "stop",
        },
      ],
      usage: {
        prompt_tokens: 617,
        completion_tokens: 881,
        total_tokens: 1498,
      },
      system_fingerprint: null,
    },
  },
  {
    url: "https://api.openai.com/v1/chat/completions",
    method: "POST",
    body: {
      model: "gpt-3.5-turbo-0125",
      temperature: 1,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
      n: 1,
      stream: false,
      messages: [
        {
          role: "system",
          content:
            "\n            Hello, You are Mia.\n            Your role is: Validator.\n            Your background is: Quality Assurance.\n            Your main goal is: Ensure the specifications are accurate and complete..\n            Tools available for your use: No specific tools assigned.\n            Task description: Review the technical specifications to ensure they match the founder's vision and that are technically feasible.\n        ",
        },
        {
          role: "user",
          content:
            '\n            Hi Mia, please complete the following task: Review the technical specifications to ensure they match the founder\'s vision and that are technically feasible..\n            Your expected output should be: "A validated technical specifications document ready for development. Must be in Markdown format.".\n            Incorporate the following findings and insights from previous tasks: "# Detailed Technical Specifications Document\n\n## User Stories:\n1. As a new user, I want to easily register and create an account on the SAAS platform.\n2. As an existing user, I want to have a referral code/promo code field available during registration.\n3. As an existing user, I want to generate unique referral links to share with potential referrals.\n4. As an existing user, I want to track successful referrals using unique links.\n5. As a user, I want to have a dashboard to monitor my referral activities and rewards.\n6. As a user, I want to receive rewards for successful referrals, such as discounts, credits, or premium features.\n7. As a user, I want rewards to be automatically applied to my account when referrals meet specified criteria.\n8. As a user, I want to receive automated emails or notifications for successful referrals and reward notifications.\n9. As a user, I want updates on referral program performance and upcoming promotions.\n10. As a user, I want to access reports on referral program effectiveness, conversion rates, ROI, and user engagement.\n11. As a user, I want the referral program seamlessly integrated into the existing SAAS platform interface.\n12. As a user, I want the referral program to be compatible with different devices and operating systems.\n13. As a user, I want clear terms and conditions for the referral program to avoid misuse and confusion.\n14. As a user, I want reliable customer support for questions or issues related to the referral program.\n15. As a user, I want assistance in setting up referral links, tracking referrals, and claiming rewards.\n16. As a user, I want thorough testing of the referral program functionalities to ensure bug-free operation.\n17. As a user, I want the program to function correctly across different scenarios and user interactions.\n18. As a user, I want to provide feedback on my experience with the referral program to help improve it continuously.\n\n## System Requirements:\n1. User Registration and Account Creation:\n   - Web-based registration form with fields for necessary user information.\n   - Database to store user account details securely.\n2. Referral Tracking and Management:\n   - Algorithm to generate unique referral links for each user.\n   - Database to track referral activities and successful referrals.\n3. Incentives and Rewards System:\n   - Logic to define and apply rewards based on referral criteria.\n   - Secure mechanism to apply rewards to user accounts.\n4. Communication and Notifications:\n   - Email or notification system for automated communications.\n   - Notification triggers for successful referrals and reward notifications.\n5. Analytics and Reporting:\n   - Reporting module to generate reports on referral program effectiveness.\n   - Analytics tools for monitoring conversion rates, ROI, and user engagement.\n6. Integration and Compatibility:\n   - Interface design for seamless integration with existing SAAS platform.\n   - Testing on different devices and operating systems for compatibility.\n7. Terms and Conditions:\n   - Legal documentation for clear terms and conditions of the referral program.\n   - Guidelines on eligibility, rewards distribution, and program modifications.\n8. Customer Support and Assistance:\n   - Helpdesk system for providing customer support on the referral program.\n   - Assistance tools for setting up referral links, tracking referrals, and claiming rewards.\n9. Testing and Quality Assurance:\n   - Test cases and scenarios for comprehensive testing of referral program functionalities.\n   - Bug tracking system for identifying and resolving errors.\n10. Feedback Collection and Improvements:\n   - Feedback collection mechanism for user input on the referral program.\n   - Process for implementing continuous improvements based on feedback.\n\n## Acceptance Criteria:\n- The user registration process should be completed within 2 minutes.\n- Unique referral links should be generated accurately and track referrals successfully.\n- Rewards should be applied automatically once referral criteria are met.\n- Users should receive email notifications for successful referrals and rewards.\n- Reports on referral program effectiveness should be accessible within the dashboard.\n- The referral program interface should be seamless with the existing platform.\n- Compliance with terms and conditions should be enforced throughout the program.\n- Customer support inquiries should be resolved within 24 hours.\n- The referral program should function without errors across different devices and operating systems.\n- Continuous feedback should be gathered and implemented for program improvements.\n\nBy following these detailed technical specifications, the referral program on our SAAS platform will be effectively implemented to encourage user engagement, growth, and brand loyalty."\n        ',
        },
      ],
    },
    response: {
      id: "chatcmpl-9lagN084wCtOARdquwvHy9hsbXm7h",
      object: "chat.completion",
      created: 1721129451,
      model: "gpt-3.5-turbo-0125",
      choices: [
        {
          index: 0,
          message: {
            role: "assistant",
            content:
              "# Validated Technical Specifications Document\n\n## User Stories:\n1. As a new user, I want to easily register and create an account on the SAAS platform.\n2. As an existing user, I want to have a referral code/promo code field available during registration.\n3. As an existing user, I want to generate unique referral links to share with potential referrals.\n4. As an existing user, I want to track successful referrals using unique links.\n5. As a user, I want to have a dashboard to monitor my referral activities and rewards.\n6. As a user, I want to receive rewards for successful referrals, such as discounts, credits, or premium features.\n7. As a user, I want rewards to be automatically applied to my account when referrals meet specified criteria.\n8. As a user, I want to receive automated emails or notifications for successful referrals and reward notifications.\n9. As a user, I want updates on referral program performance and upcoming promotions.\n10. As a user, I want to access reports on referral program effectiveness, conversion rates, ROI, and user engagement.\n11. As a user, I want the referral program seamlessly integrated into the existing SAAS platform interface.\n12. As a user, I want the referral program to be compatible with different devices and operating systems.\n13. As a user, I want clear terms and conditions for the referral program to avoid misuse and confusion.\n14. As a user, I want reliable customer support for questions or issues related to the referral program.\n15. As a user, I want assistance in setting up referral links, tracking referrals, and claiming rewards.\n16. As a user, I want thorough testing of the referral program functionalities to ensure bug-free operation.\n17. As a user, I want the program to function correctly across different scenarios and user interactions.\n18. As a user, I want to provide feedback on my experience with the referral program to help improve it continuously.\n\n## System Requirements:\n1. User Registration and Account Creation:\n   - Web-based registration form with fields for necessary user information.\n   - Database to store user account details securely.\n2. Referral Tracking and Management:\n   - Algorithm to generate unique referral links for each user.\n   - Database to track referral activities and successful referrals.\n3. Incentives and Rewards System:\n   - Logic to define and apply rewards based on referral criteria.\n   - Secure mechanism to apply rewards to user accounts.\n4. Communication and Notifications:\n   - Email or notification system for automated communications.\n   - Notification triggers for successful referrals and reward notifications.\n5. Analytics and Reporting:\n   - Reporting module to generate reports on referral program effectiveness.\n   - Analytics tools for monitoring conversion rates, ROI, and user engagement.\n6. Integration and Compatibility:\n   - Interface design for seamless integration with existing SAAS platform.\n   - Testing on different devices and operating systems for compatibility.\n7. Terms and Conditions:\n   - Legal documentation for clear terms and conditions of the referral program.\n   - Guidelines on eligibility, rewards distribution, and program modifications.\n8. Customer Support and Assistance:\n   - Helpdesk system for providing customer support on the referral program.\n   - Assistance tools for setting up referral links, tracking referrals, and claiming rewards.\n9. Testing and Quality Assurance:\n   - Test cases and scenarios for comprehensive testing of referral program functionalities.\n   - Bug tracking system for identifying and resolving errors.\n10. Feedback Collection and Improvements:\n   - Feedback collection mechanism for user input on the referral program.\n   - Process for implementing continuous improvements based on feedback.\n\n## Acceptance Criteria:\n- The user registration process should be completed within 2 minutes.\n- Unique referral links should be generated accurately and track referrals successfully.\n- Rewards should be applied automatically once referral criteria are met.\n- Users should receive email notifications for successful referrals and rewards.\n- Reports on referral program effectiveness should be accessible within the dashboard.\n- The referral program interface should be seamless with the existing platform.\n- Compliance with terms and conditions should be enforced throughout the program.\n- Customer support inquiries should be resolved within 24 hours.\n- The referral program should function without errors across different devices and operating systems.\n- Continuous feedback should be gathered and implemented for program improvements.\n\nBy following these detailed technical specifications, the referral program on our SAAS platform will be effectively implemented to encourage user engagement, growth, and brand loyalty.",
          },
          logprobs: null,
          finish_reason: "stop",
        },
      ],
      usage: {
        prompt_tokens: 1030,
        completion_tokens: 882,
        total_tokens: 1912,
      },
      system_fingerprint: null,
    },
  },
];

module.exports = recordedRequests;

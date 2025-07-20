import { getTemplateById } from "@/data/templates";

/**
 * Get the template category from a template ID
 * @param {string} templateId - The template ID
 * @returns {string} The template category
 */
export const getTemplateCategoryFromId = (templateId) => {
  const template = getTemplateById(templateId);
  return template ? template.category : "portfolio"; // Default to portfolio if not found
};

/**
 * Validate form data based on template category
 * @param {Object} formData - The form data to validate
 * @param {string} templateCategory - The template category
 * @returns {Object} Validation result with isValid and errors
 */
export const validateFormData = (formData, templateCategory) => {
  const errors = [];
  let isValid = true;

  // Common validation for all templates
  if (!formData.url) {
    errors.push("URL is required");
    isValid = false;
  }

  // Template-specific validation
  switch (templateCategory) {
    case "portfolio":
      if (!validatePortfolioData(formData, errors)) {
        isValid = false;
      }
      break;
    case "business":
      if (!validateBusinessData(formData, errors)) {
        isValid = false;
      }
      break;
    case "ecommerce":
      if (!validateEcommerceData(formData, errors)) {
        isValid = false;
      }
      break;
    case "blog":
      if (!validateBlogData(formData, errors)) {
        isValid = false;
      }
      break;
    case "landing":
      if (!validateLandingData(formData, errors)) {
        isValid = false;
      }
      break;
    default:
      // Default validation for unknown template categories
      if (!validatePortfolioData(formData, errors)) {
        isValid = false;
      }
  }

  return { isValid, errors };
};

/**
 * Validate portfolio template data
 * @param {Object} formData - The form data to validate
 * @param {Array} errors - Array to collect validation errors
 * @returns {boolean} Whether the data is valid
 */
const validatePortfolioData = (formData, errors) => {
  let isValid = true;

  // Check for required home section fields
  if (!formData.home) {
    errors.push("Home section is required");
    isValid = false;
  } else {
    if (!formData.home.name) {
      errors.push("Name is required in home section");
      isValid = false;
    }
    if (!formData.home.occupation) {
      errors.push("Occupation is required in home section");
      isValid = false;
    }
  }

  // Check for required about section
  if (!formData.about || !formData.about.desc) {
    errors.push("About description is required");
    isValid = false;
  }

  // Validate skills if present
  if (formData.skills && Array.isArray(formData.skills)) {
    formData.skills.forEach((skill, index) => {
      if (!skill.name) {
        errors.push(`Skill name is required for skill #${index + 1}`);
        isValid = false;
      }
    });
  }

  // Validate projects if present
  if (formData.projects && Array.isArray(formData.projects)) {
    formData.projects.forEach((project, index) => {
      if (!project.title) {
        errors.push(`Project title is required for project #${index + 1}`);
        isValid = false;
      }
    });
  }

  // Validate contact information
  if (!formData.contact || !formData.contact.email) {
    errors.push("Contact email is required");
    isValid = false;
  }

  return isValid;
};

/**
 * Validate business template data
 * @param {Object} formData - The form data to validate
 * @param {Array} errors - Array to collect validation errors
 * @returns {boolean} Whether the data is valid
 */
const validateBusinessData = (formData, errors) => {
  let isValid = true;

  // Check for required company section fields
  if (!formData.company) {
    errors.push("Company section is required");
    isValid = false;
  } else {
    if (!formData.company.name) {
      errors.push("Company name is required");
      isValid = false;
    }
    if (!formData.company.description) {
      errors.push("Company description is required");
      isValid = false;
    }
  }

  // Validate services if present
  if (formData.services && Array.isArray(formData.services)) {
    formData.services.forEach((service, index) => {
      if (!service.title) {
        errors.push(`Service title is required for service #${index + 1}`);
        isValid = false;
      }
      if (!service.description) {
        errors.push(`Service description is required for service #${index + 1}`);
        isValid = false;
      }
    });
  }

  // Validate contact information
  if (!formData.contact || !formData.contact.email) {
    errors.push("Contact email is required");
    isValid = false;
  }

  return isValid;
};

/**
 * Validate ecommerce template data
 * @param {Object} formData - The form data to validate
 * @param {Array} errors - Array to collect validation errors
 * @returns {boolean} Whether the data is valid
 */
const validateEcommerceData = (formData, errors) => {
  let isValid = true;

  // Check for required store section fields
  if (!formData.store) {
    errors.push("Store section is required");
    isValid = false;
  } else {
    if (!formData.store.name) {
      errors.push("Store name is required");
      isValid = false;
    }
    if (!formData.store.description) {
      errors.push("Store description is required");
      isValid = false;
    }
  }

  // Validate products if present
  if (formData.products && Array.isArray(formData.products)) {
    formData.products.forEach((product, index) => {
      if (!product.name) {
        errors.push(`Product name is required for product #${index + 1}`);
        isValid = false;
      }
      if (!product.price) {
        errors.push(`Product price is required for product #${index + 1}`);
        isValid = false;
      }
    });
  } else {
    errors.push("At least one product is required");
    isValid = false;
  }

  // Validate contact information
  if (!formData.contact || !formData.contact.email) {
    errors.push("Contact email is required");
    isValid = false;
  }

  return isValid;
};

/**
 * Validate blog template data
 * @param {Object} formData - The form data to validate
 * @param {Array} errors - Array to collect validation errors
 * @returns {boolean} Whether the data is valid
 */
const validateBlogData = (formData, errors) => {
  let isValid = true;

  // Check for required blog section fields
  if (!formData.blog) {
    errors.push("Blog section is required");
    isValid = false;
  } else {
    if (!formData.blog.title) {
      errors.push("Blog title is required");
      isValid = false;
    }
    if (!formData.blog.description) {
      errors.push("Blog description is required");
      isValid = false;
    }
  }

  // Validate author information
  if (!formData.author) {
    errors.push("Author section is required");
    isValid = false;
  } else {
    if (!formData.author.name) {
      errors.push("Author name is required");
      isValid = false;
    }
  }

  // Validate posts if present
  if (formData.posts && Array.isArray(formData.posts)) {
    formData.posts.forEach((post, index) => {
      if (!post.title) {
        errors.push(`Post title is required for post #${index + 1}`);
        isValid = false;
      }
      if (!post.content) {
        errors.push(`Post content is required for post #${index + 1}`);
        isValid = false;
      }
    });
  }

  return isValid;
};

/**
 * Validate landing page template data
 * @param {Object} formData - The form data to validate
 * @param {Array} errors - Array to collect validation errors
 * @returns {boolean} Whether the data is valid
 */
const validateLandingData = (formData, errors) => {
  let isValid = true;

  // Check for required hero section fields
  if (!formData.hero) {
    errors.push("Hero section is required");
    isValid = false;
  } else {
    if (!formData.hero.title) {
      errors.push("Hero title is required");
      isValid = false;
    }
  }

  // Validate features if present
  if (formData.features && Array.isArray(formData.features)) {
    formData.features.forEach((feature, index) => {
      if (!feature.title) {
        errors.push(`Feature title is required for feature #${index + 1}`);
        isValid = false;
      }
    });
  }

  // Validate contact information if present
  if (formData.contact && formData.contact.formEnabled && !formData.contact.email) {
    errors.push("Contact email is required when contact form is enabled");
    isValid = false;
  }

  return isValid;
};

/**
 * Process file uploads based on template category
 * @param {Object} formData - The form data with file references
 * @param {string} templateCategory - The template category
 * @param {Object} uploadedFiles - Object containing uploaded file URLs
 * @returns {Object} Processed form data with file URLs
 */
export const processTemplateFiles = (formData, templateCategory, uploadedFiles) => {
  const processedData = { ...formData };

  // Process files based on template category
  switch (templateCategory) {
    case "portfolio":
      processPortfolioFiles(processedData, uploadedFiles);
      break;
    case "business":
      processBusinessFiles(processedData, uploadedFiles);
      break;
    case "ecommerce":
      processEcommerceFiles(processedData, uploadedFiles);
      break;
    case "blog":
      processBlogFiles(processedData, uploadedFiles);
      break;
    case "landing":
      processLandingFiles(processedData, uploadedFiles);
      break;
    default:
      // Default processing for unknown template categories
      processPortfolioFiles(processedData, uploadedFiles);
  }

  return processedData;
};

/**
 * Process portfolio template file uploads
 * @param {Object} formData - The form data to process
 * @param {Object} uploadedFiles - Object containing uploaded file URLs
 */
const processPortfolioFiles = (formData, uploadedFiles) => {
  // Process home section files
  if (formData.home) {
    if (uploadedFiles.home_image) {
      formData.home.image = uploadedFiles.home_image;
    }
    if (uploadedFiles.home_resume) {
      formData.home.resume = uploadedFiles.home_resume;
    }
  }

  // Process certificates files
  if (formData.about && formData.about.certificates) {
    formData.about.certificates.forEach((cert, index) => {
      const certImgKey = `certificates_${index}_img`;
      if (uploadedFiles[certImgKey]) {
        cert.img = uploadedFiles[certImgKey];
      }
    });
  }

  // Process project files
  if (formData.projects) {
    formData.projects.forEach((project, index) => {
      const projImgKey = `projects_${index}_img`;
      if (uploadedFiles[projImgKey]) {
        project.img = uploadedFiles[projImgKey];
      }
    });
  }
};

/**
 * Process business template file uploads
 * @param {Object} formData - The form data to process
 * @param {Object} uploadedFiles - Object containing uploaded file URLs
 */
const processBusinessFiles = (formData, uploadedFiles) => {
  // Process company logo
  if (formData.company && uploadedFiles.company_logo) {
    formData.company.logo = uploadedFiles.company_logo;
  }

  // Process service images
  if (formData.services) {
    formData.services.forEach((service, index) => {
      const serviceImgKey = `services_${index}_image`;
      if (uploadedFiles[serviceImgKey]) {
        service.image = uploadedFiles[serviceImgKey];
      }
    });
  }

  // Process team member photos
  if (formData.team) {
    formData.team.forEach((member, index) => {
      const memberPhotoKey = `team_${index}_photo`;
      if (uploadedFiles[memberPhotoKey]) {
        member.photo = uploadedFiles[memberPhotoKey];
      }
    });
  }

  // Process testimonial photos
  if (formData.testimonials) {
    formData.testimonials.forEach((testimonial, index) => {
      const testimonialPhotoKey = `testimonials_${index}_photo`;
      if (uploadedFiles[testimonialPhotoKey]) {
        testimonial.photo = uploadedFiles[testimonialPhotoKey];
      }
    });
  }
};

/**
 * Process ecommerce template file uploads
 * @param {Object} formData - The form data to process
 * @param {Object} uploadedFiles - Object containing uploaded file URLs
 */
const processEcommerceFiles = (formData, uploadedFiles) => {
  // Process store logo
  if (formData.store && uploadedFiles.store_logo) {
    formData.store.logo = uploadedFiles.store_logo;
  }

  // Process product images
  if (formData.products) {
    formData.products.forEach((product, index) => {
      // Check for multiple product images
      const productImages = [];
      let imgIndex = 0;
      let imgKey = `products_${index}_image_${imgIndex}`;
      
      while (uploadedFiles[imgKey]) {
        productImages.push(uploadedFiles[imgKey]);
        imgIndex++;
        imgKey = `products_${index}_image_${imgIndex}`;
      }
      
      if (productImages.length > 0) {
        product.images = productImages;
      }
    });
  }

  // Process category images
  if (formData.categories) {
    formData.categories.forEach((category, index) => {
      const categoryImgKey = `categories_${index}_image`;
      if (uploadedFiles[categoryImgKey]) {
        category.image = uploadedFiles[categoryImgKey];
      }
    });
  }
};

/**
 * Process blog template file uploads
 * @param {Object} formData - The form data to process
 * @param {Object} uploadedFiles - Object containing uploaded file URLs
 */
const processBlogFiles = (formData, uploadedFiles) => {
  // Process blog logo
  if (formData.blog && uploadedFiles.blog_logo) {
    formData.blog.logo = uploadedFiles.blog_logo;
  }

  // Process author photo
  if (formData.author && uploadedFiles.author_photo) {
    formData.author.photo = uploadedFiles.author_photo;
  }

  // Process post cover images
  if (formData.posts) {
    formData.posts.forEach((post, index) => {
      const postImgKey = `posts_${index}_coverImage`;
      if (uploadedFiles[postImgKey]) {
        post.coverImage = uploadedFiles[postImgKey];
      }
    });
  }
};

/**
 * Process landing page template file uploads
 * @param {Object} formData - The form data to process
 * @param {Object} uploadedFiles - Object containing uploaded file URLs
 */
const processLandingFiles = (formData, uploadedFiles) => {
  // Process hero image
  if (formData.hero && uploadedFiles.hero_image) {
    formData.hero.image = uploadedFiles.hero_image;
  }

  // Process feature images
  if (formData.features) {
    formData.features.forEach((feature, index) => {
      const featureImgKey = `features_${index}_image`;
      if (uploadedFiles[featureImgKey]) {
        feature.image = uploadedFiles[featureImgKey];
      }
    });
  }

  // Process testimonial photos
  if (formData.testimonials) {
    formData.testimonials.forEach((testimonial, index) => {
      const testimonialPhotoKey = `testimonials_${index}_photo`;
      if (uploadedFiles[testimonialPhotoKey]) {
        testimonial.photo = uploadedFiles[testimonialPhotoKey];
      }
    });
  }
};

/**
 * Get default form data structure based on template category
 * @param {string} templateCategory - The template category
 * @returns {Object} Default form data structure
 */
export const getDefaultFormData = (templateCategory) => {
  switch (templateCategory) {
    case "portfolio":
      return {
        url: "",
        home: {
          name: "",
          occupation: "",
          tagline: "",
          image: "",
          resume: ""
        },
        about: {
          desc: "",
          dob: "",
          website: "",
          city: "",
          deg: "",
          certificates: []
        },
        skills: [],
        projects: [],
        contact: {
          email: "",
          phone: "",
          linkedin: "",
          instagram: ""
        }
      };
    case "business":
      return {
        url: "",
        company: {
          name: "",
          tagline: "",
          founded: "",
          logo: "",
          description: ""
        },
        services: [],
        team: [],
        testimonials: [],
        contact: {
          email: "",
          phone: "",
          address: "",
          hours: "",
          map: ""
        }
      };
    case "ecommerce":
      return {
        url: "",
        store: {
          name: "",
          tagline: "",
          logo: "",
          description: "",
          currency: "USD"
        },
        products: [],
        categories: [],
        shipping: {
          methods: [],
          policy: ""
        },
        payment: {
          methods: [],
          policy: ""
        },
        contact: {
          email: "",
          phone: "",
          address: ""
        }
      };
    case "blog":
      return {
        url: "",
        blog: {
          title: "",
          tagline: "",
          logo: "",
          description: ""
        },
        author: {
          name: "",
          bio: "",
          photo: "",
          social: {
            twitter: "",
            instagram: ""
          }
        },
        categories: [],
        posts: [],
        newsletter: {
          enabled: true,
          title: "",
          description: ""
        },
        contact: {
          email: "",
          form: {
            enabled: true
          }
        }
      };
    case "landing":
      return {
        url: "",
        hero: {
          title: "",
          subtitle: "",
          image: "",
          buttonText: "",
          buttonUrl: ""
        },
        features: [],
        testimonials: [],
        pricing: [],
        faq: [],
        contact: {
          email: "",
          phone: "",
          formEnabled: true
        }
      };
    default:
      return getDefaultFormData("portfolio");
  }
};

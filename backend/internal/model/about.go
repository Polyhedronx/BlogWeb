package model

// About contains structured information about the blog author.
type About struct {
	Name        string           `json:"name"`
	Avatar      string           `json:"avatar"`
	Bio         string           `json:"bio"`
	SocialLinks []AboutSocialLink `json:"social_links"`
	Skills      []string         `json:"skills"`
	Content     string           `json:"content"`
}

// AboutSocialLink represents a social media or contact link.
type AboutSocialLink struct {
	Name string `json:"name"`
	URL  string `json:"url"`
}

import { CircleDot, CheckCircle2, ListFilter, Timer, UserCircle2 } from "lucide-react";

export const automationLevels = [
    {
        label: "Level of Automation 1: Fully Manual Classification",
        route: "/loa1",
        description: "Find the outlier emotion independently, without any system assistance.",
        icon: UserCircle2,
        automationLevel: 1,
        popoverContent: {
            title: "Level of Automation 1: Fully Manual Classification",
            description: "This configuration represents the lower boundary (Level of Automation 1), where the entire classification task is performed manually without any computational support.",
            details: [
                "You'll identify outlier emotions among presented images, performing all aspects of the classification task independently.",
                "Make decisions without any computational or system assistance.",
                "Complete the classification based purely on your judgment.",
                "This represents the baseline configuration where all subtasks are assigned to the user."
            ],
            interaction: [
                "For each round, review all 6 facial expressions",
                "Select the image that shows a different emotion from the others",
                "Click on the 'Confirm Selection' button to proceed to the next question",
                "You must select and confirm your choice to proceed to the next round"
            ]
        }
    },
    {
        label: "Level of Automation 2: Assisted Classification",
        route: "/loa2",
        description: "System recommends possible outliers while you make the final decision.",
        icon: CircleDot,
        automationLevel: 2,
        popoverContent: {
            title: "Level of Automation 2: Assisted Classification",
            description: "In this configuration, you will perform all subtasks while receiving system-generated decision alternatives and the system might not always be correct.",
            details: [
                "Review the system's suggested outlier emotions",
                "Analyze the provided suggestions alongside your own observations",
                "Select the most appropriate outlier emotion based on your judgment",
                "Maintain full control over the final classification decision"
            ],
            interaction: [
                "For each round, review all 6 facial expressions",
                "The system will highlight 3 images with the highest outlier probability",
                "Click on the image you believe contains the outlier emotion",
                "Confirm your selection by clicking the 'Confirm Selection' button"
            ]
        }
    },
    {
        label: "Level of Automation 3: Ranked Classification",
        route: "/loa3",
        description: "Choose from a system-generated ranked list of potential outliers.",
        icon: ListFilter,
        automationLevel: 3,
        popoverContent: {
            title: "Level of Automation 3: Ranked Classification",
            description: "In this configuration, the system performs initial processing and ranking, while you maintain decision authority and the system's rankings might not always be correct.",
            details: [
                "Review ranked images according to their probability of being an outlier",
                "Make your selection informed by both the system's rankings and your visual inspection",
                "Adjust the selection if necessary based on your judgment",
                "Confirm the final classification decision"
            ],
            interaction: [
                "For each round, review all 6 facial expressions",
                "The system displays images along a green-to-red gradient, with colors and order corresponding to the probability of being an outlier, from highest to lowest.",
                "Click on the image you believe contains the outlier emotion",
                "Confirm your selection by clicking the 'Confirm Selection' button"
            ]
        }
    },
    {
        label: "Level of Automation 4-5: Ranked / Validated Classification",
        route: "/loa4-5",
        description: "Review and confirm the system's pre-selected outlier choice.",
        icon: CheckCircle2,
        automationLevel: 4,
        popoverContent: {
            title: "Level of Automation 4-5: Ranked / Validated Classification",
            description: "In this unified configuration (combining Levels 4 and 5), the system provides enhanced automation with preselection and the system's recommendations might not always be correct.",
            details: [
                "Review both the preselected recommendation and the complete ranked list",
                "Choose to either accept the system's suggestion (highest probability image) or select a different image",
                "Make your final decision based on visual inspection and other considerations",
                "This configuration enhances automation through preprocessing, ranking, and preselection while maintaining human authority"
            ],
            interaction: [
                "For each round, review all 6 facial expressions",
                "The system displays images along a green-to-red gradient, with colors and order corresponding to the probability of being an outlier, from highest to lowest.",
                "The system will preselect the top-ranked image as the recommended outlier",
                "Accept the system's recommendation or select a different image",
                "Confirm your selection by clicking the 'Confirm Selection' button"
            ]
        }
    },
    {
        label: "Level of Automation 6: Automated Classification with Veto",
        route: "/loa6",
        description: "System identifies the outlier with option for quick override.",
        icon: Timer,
        automationLevel: 5,
        popoverContent: {
            title: "Level of Automation 6: Automated Classification with Veto",
            description: "This configuration represents the upper boundary of automation in facial emotion recognition, balancing efficiency with necessary human oversight and the system's automatic selections might not always be correct.",
            details: [
                "Monitor the system as it selects and prepares to lock in its decision",
                "Exercise your veto option during a limited time window if needed",
                "Enter manual mode to select a different image if you vetoed the system's choice",
                "Allow the system's decision to be automatically confirmed if no veto is issued"
            ],
            interaction: [
                "For each round, the system will automatically select an outlier",
                "The system displays images along a green-to-red gradient, with colors and order corresponding to the probability of being an outlier, from highest to lowest.",
                "The system will preselect the top-ranked image as the recommended outlier",
                "A countdown timer will appear, during which you can veto the system's decision",
                "If you disagree with the selection, click the 'Veto' button within the time window",
                "After vetoing, select a different image and confirm your selection"
            ]
        }
    },
];

export const loaInfoLoa1 = {
    title: "Level of Automation 1: Fully Manual Classification",
    description: "This configuration represents the lower boundary (Level of Automation 1), where the entire classification task is performed manually without any computational support.",
    details: [
        "You'll identify outlier emotions among presented images, performing all aspects of the classification task independently.",
        "Make decisions without any computational or system assistance.",
        "Complete the classification based purely on your judgment.",
        "This represents the baseline configuration where all subtasks are assigned to the user."
    ],
    interaction: [
        "For each round, review all 6 facial expressions",
        "Select the image that shows a different emotion from the others",
        "Click on the 'Confirm Selection' button to proceed to the next question",
        "You must select and confirm your choice to proceed to the next round"
    ]
};

export const loaInfoLoa2 = {
    title: "Level of Automation 2: Assisted Classification",
    description: "In this configuration, you will perform all subtasks while receiving system-generated decision alternatives and the system might not always be correct.",
    details: [
        "Review the system's suggested outlier emotions",
        "Analyze the provided suggestions alongside your own observations",
        "Select the most appropriate outlier emotion based on your judgment",
        "Maintain full control over the final classification decision"
    ],
    interaction: [
        "For each round, review all 6 facial expressions",
        "The system will highlight 3 images with the highest outlier probability",
        "Click on the image you believe contains the outlier emotion",
        "Confirm your selection by clicking the 'Confirm Selection' button"
    ]
};

export const loaInfoLoa3 = {
    title: "Level of Automation 3: Ranked Classification",
    description: "In this configuration, the system performs initial processing and ranking, while you maintain decision authority and the system's rankings might not always be correct.",
    details: [
        "Review ranked images according to their probability of being an outlier",
        "Make your selection informed by both the system's rankings and your visual inspection",
        "Adjust the selection if necessary based on your judgment",
        "Confirm the final classification decision"
    ],
    interaction: [
        "For each round, review all 6 facial expressions",
        "The system displays images along a green-to-red gradient, with colors and order corresponding to the probability of being an outlier, from highest to lowest.",
        "Click on the image you believe contains the outlier emotion",
        "Confirm your selection by clicking the 'Confirm Selection' button"
    ]
};

export const loaInfoLoa45 = {
    title: "Level of Automation 4-5: Ranked / Validated Classification",
    description: "In this unified configuration (combining Levels 4 and 5), the system provides enhanced automation with preselection and the system's recommendations might not always be correct.",
    details: [
        "Review both the preselected recommendation and the complete ranked list",
        "Choose to either accept the system's suggestion (highest probability image) or select a different image",
        "Make your final decision based on visual inspection and other considerations",
        "This configuration enhances automation through preprocessing, ranking, and preselection while maintaining human authority"
    ],
    interaction: [
        "For each round, review all 6 facial expressions",
        "The system displays images along a green-to-red gradient, with colors and order corresponding to the probability of being an outlier, from highest to lowest.",
        "The system will preselect the top-ranked image as the recommended outlier",
        "Accept the system's recommendation or select a different image",
        "Confirm your selection by clicking the 'Confirm Selection' button"
    ]
};

export const loaInfoLoa6 = {
    title: "Level of Automation 6: Automated Classification with Veto",
    description: "This configuration represents the upper boundary of automation in facial emotion recognition, balancing efficiency with necessary human oversight and the system's automatic selections might not always be correct.",
    details: [
        "Monitor the system as it selects and prepares to lock in its decision",
        "Exercise your veto option during a limited time window if needed",
        "Enter manual mode to select a different image if you vetoed the system's choice",
        "Allow the system's decision to be automatically confirmed if no veto is issued"
    ],
    interaction: [
        "For each round, the system will automatically select an outlier",
        "The system displays images along a green-to-red gradient, with colors and order corresponding to the probability of being an outlier, from highest to lowest.",
        "The system will automatically select an outlier",
        "A countdown timer will appear, during which you can veto the system's decision",
        "If you disagree with the selection, click the 'Veto' button within the time window",
        "After vetoing, select a different image and confirm your selection"
    ]
};
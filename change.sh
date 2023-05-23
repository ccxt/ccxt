#!/usr/bin/env bash
previous_tag=0
for current_tag in $(git tag --sort=-creatordate)
do
    major_version=$(echo ${current_tag} | cut -d '.' -f 1)
    major_version=$(echo "$major_version" | sed -e "s/v//")
    if [ "$major_version" -ge 3 ] ;then
        if [ "$previous_tag" != 0 ]; then
            tag_date=$(git log -1 --pretty=format:'%ad' --date=short ${previous_tag})
            printf "## ${previous_tag} (${tag_date})\n\n"
            git log ${current_tag}...${previous_tag} --pretty=format:'*  %s [%h](https://github.com/ccxt/ccxt/commits/%H)' --reverse | grep -v Merge | grep -v skip | grep -v '-'
            # print $commits
            printf "\n\n"
        fi
        previous_tag=${current_tag}
    fi

done
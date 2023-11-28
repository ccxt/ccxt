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
            gh pr list --limit 100 --state all | awk -F"\t" '{print "* [" $1 "](https://github.com/ccxt/ccxt/pull/" $1 ") " $2}'
            printf "\n\n"
        fi
        previous_tag=${current_tag}
    fi
done

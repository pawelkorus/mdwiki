#!/usr/bin/env sh

v_config_file="${NWDRC_PATH:-.nwdrc}"

if [ -f $v_config_file ]; then
    v_node_version=`cat $v_config_file`
fi

if [ -z $v_node_version ]; then
    v_node_version="lts-slim"
fi

v_version_1=`echo $v_node_version | cut -d: -f1 -`
v_version_2=`echo $v_node_version | cut -d: -f2 -s -`
if [ -z $v_version_2 ]; then
    v_image_version=node:$v_version_1
else
    v_image_version=$v_version_1:$v_version_2
fi

v_current_user_id=`id -u`
v_current_group_id=`id -g`
v_command=`basename $0`

docker run --rm -v "$PWD":/usr/src/app -w /usr/src/app --user $v_current_user_id:$v_current_group_id $v_image_version $v_command "$@"
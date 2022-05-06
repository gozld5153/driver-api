import { MigrationInterface, QueryRunner } from "typeorm";

export class addGoogleOauthToWeb1651708374377 implements MigrationInterface {
    name = 'addGoogleOauthToWeb1651708374377'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`isp\` \`isp\` enum ('naver', 'kakao', 'apple', 'google', 'none') NULL DEFAULT 'none'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`isp\` \`isp\` enum ('naver', 'kakao', 'apple', 'none') NULL DEFAULT 'none'`);
    }

}

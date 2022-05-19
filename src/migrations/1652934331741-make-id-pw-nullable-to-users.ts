import { MigrationInterface, QueryRunner } from "typeorm";

export class makeIdPwNullableToUsers1652934331741 implements MigrationInterface {
    name = 'makeIdPwNullableToUsers1652934331741'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`identifier\` \`identifier\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`password\` \`password\` varchar(255) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`password\` \`password\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`identifier\` \`identifier\` varchar(255) NOT NULL`);
    }

}

import { MigrationInterface, QueryRunner } from "typeorm";

export class addOrderHeroReqjestRejectTimestamps1653701089717 implements MigrationInterface {
    name = 'addOrderHeroReqjestRejectTimestamps1653701089717'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`orders\` ADD \`heroRequestedAt\` datetime NULL`);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD \`heroRejectedAt\` datetime NULL`);
        await queryRunner.query(`ALTER TABLE \`orders\` CHANGE \`status\` \`status\` enum ('pending', 'no-driver', 'started', 'driver-matched', 'hero-requested', 'hero-rejected', 'hero-matched', 'hero-pickuped', 'loaded', 'departed', 'arrived', 'fee-calculated', 'completed', 'canceled') NOT NULL DEFAULT 'pending'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`orders\` CHANGE \`status\` \`status\` enum ('pending', 'no-driver', 'started', 'driver-matched', 'hero-matched', 'hero-pickuped', 'loaded', 'departed', 'arrived', 'fee-calculated', 'completed', 'canceled') NOT NULL DEFAULT 'pending'`);
        await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`heroRejectedAt\``);
        await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`heroRequestedAt\``);
    }

}
